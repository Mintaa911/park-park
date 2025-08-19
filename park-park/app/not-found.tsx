
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 relative">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are trying to access is unavailable or does not exist
        </p>
      </div>
    </div>
  );
} 