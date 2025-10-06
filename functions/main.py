import json
import os
import time
import logging
from typing import Dict, Any, List, Optional
import requests
from flask import Flask, request, jsonify
from functions_framework import http
from datetime import datetime, timedelta
import hashlib

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Simple in-memory rate limiting (for production, use Redis or database)
rate_limit_store = {}
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX_REQUESTS = 10  # per window per IP

# Request and Response models
class Request:
    def __init__(self, code: str, language: str):
        self.code = code
        self.language = language

class Response:
    def __init__(self, documentation: str):
        self.documentation = documentation

class ErrorResponse:
    def __init__(self, error: str):
        self.error = error

class Message:
    def __init__(self, role: str, content: str):
        self.role = role
        self.content = content

class AzureOpenAIRequest:
    def __init__(self, messages: List[Message], max_tokens: int, temperature: float):
        self.messages = messages
        self.max_tokens = max_tokens
        self.temperature = temperature

class Choice:
    def __init__(self, message: Message):
        self.message = message

class AzureOpenAIResponse:
    def __init__(self, choices: List[Choice]):
        self.choices = choices

def sanitize_input(text: str) -> str:
    """Sanitize input to prevent injection attacks"""
    if not text:
        return ""
    
    # Remove potentially dangerous characters
    dangerous_chars = ['<', '>', '"', "'", '&', '\x00', '\r', '\n']
    sanitized = text
    
    for char in dangerous_chars:
        sanitized = sanitized.replace(char, '')
    
    # Limit length to prevent abuse
    return sanitized[:50000]  # Reasonable limit for code input

def create_prompt(language: str, code: str) -> str:
    """Create a comprehensive prompt based on the language"""
    # Sanitize inputs
    language = sanitize_input(language)
    code = sanitize_input(code)
    
    # Validate language against known languages
    valid_languages = [
        'python', 'javascript', 'java', 'cpp', 'csharp', 'go', 'rust', 
        'typescript', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'r'
    ]
    
    if language.lower() not in valid_languages:
        language = 'python'  # Default fallback
    
    base_prompt = f"""Act as an expert senior software engineer specializing in {language}. 

Write a comprehensive, well-formatted documentation block for the following code snippet, adhering to standard conventions for {language}.

For the documentation, please include:
1. A clear description of what the code does
2. Parameter descriptions (if applicable)
3. Return value description (if applicable)
4. Usage examples (if helpful)
5. Any important notes or warnings

Use appropriate documentation format for {language} (e.g., JSDoc for JavaScript, Google-style for Python, JavaDoc for Java, etc.).

Here is the code to document:

{code}

Please provide only the documentation block, formatted properly for the language."""
    
    return base_prompt

def check_rate_limit(client_ip: str) -> bool:
    """Check if client has exceeded rate limit"""
    current_time = datetime.now()
    window_start = current_time - timedelta(seconds=RATE_LIMIT_WINDOW)
    
    # Clean old entries
    rate_limit_store[client_ip] = [
        req_time for req_time in rate_limit_store.get(client_ip, [])
        if req_time > window_start
    ]
    
    # Check if limit exceeded
    if len(rate_limit_store.get(client_ip, [])) >= RATE_LIMIT_MAX_REQUESTS:
        return False
    
    # Add current request
    rate_limit_store[client_ip] = rate_limit_store.get(client_ip, []) + [current_time]
    return True

def call_azure_openai(api_key: str, endpoint: str, deployment: str, prompt: str) -> str:
    """Call Azure OpenAI API to generate documentation"""
    url = f"{endpoint}/openai/deployments/{deployment}/chat/completions?api-version=2024-02-15-preview"
    
    request_body = {
        "messages": [
            {
                "role": "system",
                "content": "You are an expert software engineer who writes comprehensive, well-formatted documentation for code. Always provide clear, professional documentation that follows best practices for the given programming language."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 4000,
        "temperature": 0.3
    }
    
    headers = {
        "Content-Type": "application/json",
        "api-key": api_key
    }
    
    try:
        logger.info(f"Calling Azure OpenAI with deployment: {deployment}")
        response = requests.post(url, json=request_body, headers=headers, timeout=60)
        response.raise_for_status()
        
        azure_response = response.json()
        
        if not azure_response.get("choices"):
            logger.error("No choices in Azure OpenAI response")
            raise ValueError("No choices in response")
        
        content = azure_response["choices"][0]["message"]["content"]
        logger.info(f"Successfully generated documentation ({len(content)} characters)")
        return content
        
    except requests.exceptions.Timeout:
        logger.error("Azure OpenAI request timed out")
        raise Exception("Request timed out - please try again")
    except requests.exceptions.RequestException as e:
        logger.error(f"Azure OpenAI request failed: {e}")
        raise Exception(f"Error making request: {e}")
    except (KeyError, IndexError) as e:
        logger.error(f"Error parsing Azure OpenAI response: {e}")
        raise Exception(f"Error parsing response: {e}")
    except Exception as e:
        logger.error(f"Unexpected error in Azure OpenAI call: {e}")
        raise Exception(f"Unexpected error: {e}")

@http
def generate_docs(request):
    """Generate documentation for code using Azure OpenAI"""
    # Set CORS headers
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
    
    # Handle preflight requests
    if request.method == "OPTIONS":
        return ("", 200, headers)
    
    # Only allow POST requests
    if request.method != "POST":
        logger.warning(f"Invalid method {request.method} received")
        return (jsonify({"error": "Method not allowed"}), 405, headers)
    
    # Rate limiting
    client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', 'unknown'))
    if not check_rate_limit(client_ip):
        logger.warning(f"Rate limit exceeded for IP: {client_ip}")
        return (jsonify({"error": "Rate limit exceeded. Please try again later."}), 429, headers)
    
    try:
        # Parse request body
        request_data = request.get_json()
        if not request_data:
            logger.warning("Invalid JSON received")
            return (jsonify({"error": "Invalid JSON"}), 400, headers)
        
        code = request_data.get("code", "").strip()
        language = request_data.get("language", "").strip()
        
        # Validate request
        if not code:
            logger.warning("Empty code received")
            return (jsonify({"error": "Code is required and cannot be empty"}), 400, headers)
        
        if not language:
            logger.warning("Empty language received")
            return (jsonify({"error": "Language is required"}), 400, headers)
        
        # Validate code length
        if len(code) > 10000:  # Reasonable limit
            logger.warning(f"Code too long: {len(code)} characters")
            return (jsonify({"error": "Code is too long (max 10,000 characters)"}), 400, headers)
        
        # Get Azure OpenAI configuration
        api_key = os.getenv("AZURE_OPENAI_API_KEY")
        endpoint = os.getenv("AZURE_OPENAI_ENDPOINT")
        deployment = os.getenv("AZURE_OPENAI_DEPLOYMENT")
        
        if not api_key or not endpoint or not deployment:
            logger.error("Missing Azure OpenAI configuration")
            return (jsonify({"error": "Service configuration error"}), 500, headers)
        
        logger.info(f"Processing request for {language} code ({len(code)} characters)")
        
        # Create the prompt
        prompt = create_prompt(language, code)
        
        # Call Azure OpenAI
        try:
            documentation = call_azure_openai(api_key, endpoint, deployment, prompt)
        except Exception as e:
            logger.error(f"Azure OpenAI error: {e}")
            return (jsonify({"error": f"Documentation generation failed: {str(e)}"}), 500, headers)
        
        # Validate response
        if not documentation or not documentation.strip():
            logger.error("Empty documentation received from Azure OpenAI")
            return (jsonify({"error": "Failed to generate documentation"}), 500, headers)
        
        # Create response
        response_data = {
            "documentation": documentation.strip()
        }
        
        logger.info(f"Successfully generated documentation ({len(documentation)} characters)")
        return (jsonify(response_data), 200, headers)
        
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return (jsonify({"error": "Internal server error"}), 500, headers)

@http
def health_check(request):
    """Health check endpoint"""
    return (jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }), 200, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    })

if __name__ == "__main__":
    # For local development
    port = int(os.getenv("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=True)
