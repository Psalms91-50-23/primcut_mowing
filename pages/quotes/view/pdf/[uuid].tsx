// pages/quotes/view/pdf/[uuid].tsx
import { useRouter } from "next/router";
import { useMemo } from "react";

const  QuotePdfPage = () => {
  const router = useRouter();

  const uuid = typeof router.query.uuid === "string" ? router.query.uuid : "";
  const token = typeof router.query.token === "string" ? router.query.token : "";

  // This hits your Next.js API proxy:
  // pages/api/quotes/[quote_uuid]/pdf/index.ts  ->  /api/quotes/:uuid/pdf
  const pdfApiUrl = useMemo(() => {
    if (!uuid || !token) return "";
    return `/api/quotes/${encodeURIComponent(uuid)}/pdf?token=${encodeURIComponent(token)}`;
  }, [uuid, token]);

  const viewQuoteUrl = useMemo(() => {
    if (!uuid || !token) return "";
    return `/quotes/view/${encodeURIComponent(uuid)}?token=${encodeURIComponent(token)}`;
  }, [uuid, token]);

  if (!uuid || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-xl shadow p-6 w-full max-w-md text-center">
          <h1 className="text-xl font-bold text-green-900">Invalid PDF Link</h1>
          <p className="text-gray-600 mt-2">
            This link is missing the quote ID or token. Please use the link from your email.
          </p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-green-900">
              Quote PDF
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Quote ID: <span className="font-mono">{uuid}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={pdfApiUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded bg-green-700 text-white hover:bg-green-800"
            >
              Open / Download PDF
            </a>

            <a
              href={viewQuoteUrl}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
            >
              View Quote
            </a>

            <button
              onClick={() => router.back()}
              className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
            >
              Back
            </button>
          </div>
        </div>

        {/* PDF Preview */}
        <div className="mt-4 bg-white rounded-2xl shadow overflow-hidden">
          <iframe
            src={pdfApiUrl}
            title="Quote PDF Preview"
            className="w-full"
            style={{ height: "80vh", border: "none" }}
          />
        </div>

        {/* Small note */}
        <p className="text-xs text-gray-500 mt-3">
          If the preview doesn’t load, click “Open / Download PDF”.
        </p>
      </div>
    </div>
  );
}

export default QuotePdfPage;