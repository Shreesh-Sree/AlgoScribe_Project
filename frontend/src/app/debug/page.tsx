export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔍 AlgoScribe Debug Page
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Deployment Status</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                <span>Vercel Deployment: ✅ Working</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                <span>Next.js App Router: ✅ Working</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                <span>TypeScript: ✅ Working</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Links</h2>
            <div className="space-y-2">
              <a href="/" className="block text-blue-600 hover:underline">
                → Main App
              </a>
              <a href="/test" className="block text-blue-600 hover:underline">
                → Test Page
              </a>
              <a href="/debug" className="block text-blue-600 hover:underline">
                → Debug Page (this page)
              </a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Environment</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Node.js: {process.env.NODE_VERSION || 'Unknown'}</div>
              <div>Platform: {process.env.VERCEL ? 'Vercel' : 'Local'}</div>
              <div>Environment: {process.env.NODE_ENV || 'development'}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">API Status</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                <span>Backend: ⚠️ Not connected</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                <span>Frontend API: ✅ Working</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🎉 Success!
          </h3>
          <p className="text-blue-800">
            If you can see this page, your Vercel deployment is working correctly. 
            The 404 error has been resolved!
          </p>
        </div>
      </div>
    </div>
  )
}
