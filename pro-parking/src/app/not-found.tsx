import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 relative">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are trying to access is unavailable or does not exist
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-foreground text-white font-medium rounded-lg hover:bg-foreground/80 transition-colors duration-200"
        >
          Return to Home Page
        </Link>
      </div>
    </div>
  );
} 