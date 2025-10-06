export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          AlgoScribe Test Page
        </h1>
        <p className="text-gray-600 mb-4">
          If you can see this page, your Vercel deployment is working!
        </p>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            <strong>Status:</strong> ✅ Deployment successful
          </p>
          <p className="text-sm text-gray-500">
            <strong>Next.js:</strong> ✅ Working
          </p>
          <p className="text-sm text-gray-500">
            <strong>Routing:</strong> ✅ Working
          </p>
        </div>
      </div>
    </div>
  )
}
