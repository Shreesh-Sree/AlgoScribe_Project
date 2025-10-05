package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/GoogleCloudPlatform/functions-framework-go/funcframework"
)

// Request represents the incoming request body
type Request struct {
	Code     string `json:"code"`
	Language string `json:"language"`
}

// Response represents the response body
type Response struct {
	Documentation string `json:"documentation"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}

// AzureOpenAIRequest represents the request to Azure OpenAI
type AzureOpenAIRequest struct {
	Messages    []Message `json:"messages"`
	MaxTokens   int       `json:"max_tokens"`
	Temperature float64   `json:"temperature"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// AzureOpenAIResponse represents the response from Azure OpenAI
type AzureOpenAIResponse struct {
	Choices []Choice `json:"choices"`
}

type Choice struct {
	Message Message `json:"message"`
}

func generateDocs(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Only allow POST requests
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse request body
	var req Request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	// Validate request
	if req.Code == "" || req.Language == "" {
		http.Error(w, "Missing required fields: code and language", http.StatusBadRequest)
		return
	}

	// Get Azure OpenAI configuration
	apiKey := os.Getenv("AZURE_OPENAI_API_KEY")
	endpoint := os.Getenv("AZURE_OPENAI_ENDPOINT")
	deployment := os.Getenv("AZURE_OPENAI_DEPLOYMENT")

	if apiKey == "" || endpoint == "" || deployment == "" {
		log.Printf("Missing Azure OpenAI configuration")
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Create the prompt
	prompt := createPrompt(req.Language, req.Code)

	// Call Azure OpenAI
	documentation, err := callAzureOpenAI(apiKey, endpoint, deployment, prompt)
	if err != nil {
		log.Printf("Error calling Azure OpenAI: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Create response
	response := Response{
		Documentation: documentation,
	}

	// Set content type and return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func createPrompt(language, code string) string {
	// Create a comprehensive prompt based on the language
	basePrompt := fmt.Sprintf(`Act as an expert senior software engineer specializing in %s. 

Write a comprehensive, well-formatted documentation block for the following code snippet, adhering to standard conventions for %s.

For the documentation, please include:
1. A clear description of what the code does
2. Parameter descriptions (if applicable)
3. Return value description (if applicable)
4. Usage examples (if helpful)
5. Any important notes or warnings

Use appropriate documentation format for %s (e.g., JSDoc for JavaScript, Google-style for Python, JavaDoc for Java, etc.).

Here is the code to document:

%s

Please provide only the documentation block, formatted properly for the language.`, language, language, language, code)

	return basePrompt
}

func callAzureOpenAI(apiKey, endpoint, deployment, prompt string) (string, error) {
	url := fmt.Sprintf("%s/openai/deployments/%s/chat/completions?api-version=2024-02-15-preview", endpoint, deployment)

	requestBody := AzureOpenAIRequest{
		Messages: []Message{
			{
				Role:    "system",
				Content: "You are an expert software engineer who writes comprehensive, well-formatted documentation for code. Always provide clear, professional documentation that follows best practices for the given programming language.",
			},
			{
				Role:    "user",
				Content: prompt,
			},
		},
		MaxTokens:   4000,
		Temperature: 0.3,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("error marshaling request: %v", err)
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("error creating request: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("api-key", apiKey)

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("error making request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("Azure OpenAI API error: %d - %s", resp.StatusCode, string(body))
	}

	var azureResponse AzureOpenAIResponse
	if err := json.NewDecoder(resp.Body).Decode(&azureResponse); err != nil {
		return "", fmt.Errorf("error decoding response: %v", err)
	}

	if len(azureResponse.Choices) == 0 {
		return "", fmt.Errorf("no choices in response")
	}

	return azureResponse.Choices[0].Message.Content, nil
}

func main() {
	// Register the function
	funcframework.RegisterHTTPFunction("/", generateDocs)

	// Start the server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	if err := funcframework.Start(port); err != nil {
		log.Fatalf("funcframework.Start: %v\n", err)
	}
}
