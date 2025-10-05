# AlgoScribe - AI-Powered Code Documentation Generator
## 🎓 College Project - Full-Stack Web Application with AI Integration

A comprehensive web application that demonstrates modern full-stack development skills by using Azure OpenAI to automatically generate professional documentation for code snippets. Built as an academic project showcasing React, Next.js, Go, PostgreSQL, and AI integration.

## ✨ Project Features

- 🤖 **AI Integration**: Azure OpenAI GPT-4 for intelligent code analysis
- 🎨 **Modern UI**: Claude.AI-inspired interface with responsive design
- 🚀 **Full-Stack**: Next.js frontend with Go backend
- 📊 **Database**: PostgreSQL with Prisma ORM for data persistence
- 🔐 **Authentication**: Secure user management with NextAuth.js
- 🌐 **Multi-Language**: Supports 10+ programming languages
- 📈 **Analytics**: User dashboard with usage tracking
- ☁️ **Cloud Ready**: Firebase and Vercel deployment

## 🏗️ Architecture

```
AlgoScribe/
├── frontend-nextjs/          # Next.js frontend
│   ├── src/app/             # App Router pages
│   ├── src/app/api/         # API routes
│   └── package.json          # Frontend dependencies
├── functions/               # Go Cloud Function
│   ├── main.go              # Backend logic
│   └── go.mod               # Go dependencies
├── firebase.json            # Firebase configuration
└── README.md                # This file
```

## 🎓 Academic Project Information

### **Learning Objectives**
- Demonstrate full-stack web development skills
- Integrate AI services into web applications
- Design and implement relational databases
- Implement secure authentication systems
- Deploy applications to cloud platforms

### **Technical Skills Demonstrated**
- **Frontend**: React, Next.js, TypeScript, Tailwind CSS
- **Backend**: Go, RESTful APIs, Cloud Functions
- **Database**: PostgreSQL, Prisma ORM, Database Design
- **AI/ML**: Azure OpenAI, Prompt Engineering
- **Authentication**: NextAuth.js, JWT, Session Management
- **Deployment**: Firebase, Vercel, Cloud Services

### **Academic Documentation**
- [Project Report](PROJECT_REPORT.md) - Technical implementation details
- [User Manual](USER_MANUAL.md) - Application usage guide
- [Presentation Outline](PRESENTATION_OUTLINE.md) - Academic presentation
- [College Setup Guide](COLLEGE_PROJECT_SETUP.md) - Academic project setup

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Go 1.21+
- PostgreSQL database
- Azure OpenAI API access (free tier available)
- Git for version control

### 1. Clone and Setup

```bash
git clone <your-repo>
cd algoscribe
```

### 2. Frontend Setup

```bash
cd frontend-nextjs
npm install
cp env.example .env.local
```

Edit `.env.local` with your Azure OpenAI credentials:
```env
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```

### 3. Backend Setup

```bash
cd ../functions
go mod tidy
```

Set environment variables:
```bash
export AZURE_OPENAI_API_KEY="your-api-key"
export AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
export AZURE_OPENAI_DEPLOYMENT="your-deployment-name"
```

### 4. Local Development

**Start the backend:**
```bash
cd functions
go run main.go
```

**Start the frontend:**
```bash
cd frontend-nextjs
npm run dev
```

Visit `http://localhost:3000` to see the application!

## 🌐 Deployment

### Option 1: Vercel (Recommended)

1. **Deploy Frontend:**
```bash
cd frontend-nextjs
npx vercel
```

2. **Deploy Backend to Firebase:**
```bash
cd functions
firebase deploy --only functions
```

3. **Update Environment Variables:**
   - In Vercel dashboard, add your Azure OpenAI credentials
   - Set `BACKEND_URL` to your Firebase function URL

### Option 2: Firebase

1. **Build and Deploy:**
```bash
cd frontend-nextjs
npm run build
cd ..
firebase deploy
```

2. **Set Environment Variables:**
```bash
firebase functions:config:set azure.openai.api_key="your-api-key"
firebase functions:config:set azure.openai.endpoint="your-endpoint"
firebase functions:config:set azure.openai.deployment="your-deployment"
```

## 🔧 Configuration

### Azure OpenAI Setup

1. Create an Azure OpenAI resource in Azure Portal
2. Deploy a model (e.g., GPT-4, GPT-3.5-turbo)
3. Get your API key and endpoint URL
4. Note your deployment name

### Environment Variables

**Frontend (.env.local):**
```env
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
BACKEND_URL=http://localhost:8080  # For local development
```

**Backend:**
```env
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
```

## 🎨 UI Features

The interface is designed to match Claude.AI's beautiful design:

- **Clean Layout**: Minimalist, professional design
- **Orange Accent**: Claude's signature orange color scheme
- **Smooth Animations**: Polished interactions and transitions
- **Responsive Design**: Works perfectly on all devices
- **Syntax Highlighting**: Beautiful code rendering
- **Copy Functionality**: One-click documentation copying

## 🔌 API Endpoints

### POST /api/generate

Generates documentation for the provided code.

**Request:**
```json
{
  "code": "function example() { return 'hello'; }",
  "language": "javascript"
}
```

**Response:**
```json
{
  "documentation": "/**\n * Example function that returns a greeting\n * @returns {string} A greeting message\n */\nfunction example() { return 'hello'; }"
}
```

## 🛠️ Development

### Frontend Development
```bash
cd frontend-nextjs
npm run dev
```

### Backend Development
```bash
cd functions
go run main.go
```

### Testing
```bash
# Test the API directly
curl -X POST http://localhost:8080/api/generate \
  -H "Content-Type: application/json" \
  -d '{"code": "function test() { return 42; }", "language": "javascript"}'
```

## 🔒 Security

- API keys are stored securely in environment variables
- CORS is properly configured
- Input validation on all requests
- No sensitive data exposed to frontend

## 📝 Supported Languages

- JavaScript
- Python
- Java
- C++
- C#
- Go
- Rust
- TypeScript
- PHP
- Ruby

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend URL is correctly configured
2. **API Key Issues**: Verify Azure OpenAI credentials are set correctly
3. **Build Errors**: Make sure all dependencies are installed

### Getting Help

- Check the logs: `firebase functions:log` or Vercel dashboard
- Verify environment variables are set correctly
- Ensure Azure OpenAI service is accessible

---

Built with ❤️ using Next.js, Go, and Azure OpenAI