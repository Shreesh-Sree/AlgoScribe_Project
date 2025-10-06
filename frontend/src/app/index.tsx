export default function IndexPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🚀 AlgoScribe
        </h1>
        <p className="text-gray-600 mb-6">
          AI-Powered Code Documentation Generator
        </p>
        <div className="space-y-3">
          <div className="flex items-center text-green-600">
            <span className="mr-2">✅</span>
            <span>Vercel Deployment Working</span>
          </div>
          <div className="flex items-center text-green-600">
            <span className="mr-2">✅</span>
            <span>Next.js App Router</span>
          </div>
          <div className="flex items-center text-green-600">
            <span className="mr-2">✅</span>
            <span>Routing Fixed</span>
          </div>
        </div>
        <div className="mt-6">
          <a 
            href="/" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Go to Main App
          </a>
        </div>
      </div>
    </div>
  )
}
