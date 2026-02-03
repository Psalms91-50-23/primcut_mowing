// pages/404.tsx
import Link from "next/link";

export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-green-900 px-4">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">
        Page Not Found
      </h2>
      <p className="text-center text-gray-700 mb-8">
        Oops! The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="bg-green-900 text-white px-6 py-3 rounded-lg shadow hover:bg-green-800 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
}
