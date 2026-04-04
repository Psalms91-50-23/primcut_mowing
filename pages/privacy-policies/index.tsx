import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/router";

type PrivacyPolicy = {
  uuid: string;
  version: string;
  title: string;
  content: string;
  short_summary?: string | null;
  pdf_url?: string | null;
  effective_date?: string | null;
};

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const [policy, setPolicy] = useState<PrivacyPolicy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/privacy-policies/latest");

        const rawText = await res.text();

        let data: PrivacyPolicy;

        try {
          data = JSON.parse(rawText);
        } catch {
          throw new Error("Invalid response from server");
        }

        if (!res.ok) {
          throw new Error(data?.title || "Failed to load privacy policy");
        }

        setPolicy(data);
      } catch (err) {
        console.error("Privacy policy fetch error:", err);
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPolicy();
  }, []);

  const formatDate = (date?: string | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-NZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm">Loading privacy policy...</p>
      </div>
    );
  }

  if (error || !policy) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-red-500 text-sm">
          {error || "Privacy policy is currently unavailable."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-8">
    {/* Header */}
    <div className="sticky top-20 z-50 flex justify-end bg-white/30 backdrop-blur-md px-4 py-3 mb-4 border-b border-gray-200 shadow-none">
      <button
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push("/"); // or "/dashboard" or previous safe page
          }
        }}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition cursor-pointer hover:bg-slate-100 active:scale-[0.98]"
      >
        ← Back
      </button>
    </div>
    <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
        {policy.title}
        </h1>

        <div className="text-sm text-gray-500">
        <span>Version {policy.version}</span>
        {policy.effective_date && (
            <span> • Effective {formatDate(policy.effective_date)}</span>
        )}
        </div>
    </div>

    {/* Summary */}
    {policy.short_summary && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-sm text-gray-700 leading-relaxed">
            {policy.short_summary}
        </p>
        </div>
    )}

    {/* Content */}
    {/* <div className="prose max-w-none whitespace-pre-line">
        {policy.content}
    </div> */}
    {/* <div className="prose max-w-none">
        <ReactMarkdown>{policy.content}</ReactMarkdown>
    </div> */}
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-6">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">
              {children}
            </h2>
          ),
          p: ({ children }) => (
            <p className="text-gray-700 leading-7 mb-4">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-5 space-y-2 text-gray-700">
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className="leading-7">
              {children}
            </li>
          ),
        }}
      >
        {policy.content}
      </ReactMarkdown>
    </div>

    {/* PDF */}
    {policy.pdf_url && (
    <div className="pt-4">
        <a
        href={policy.pdf_url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium text-blue-600 hover:underline"
        >
        Download full Privacy Policy (PDF)
        </a>
    </div>
    )}
    </div>
  );
}