import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Terms = {
  version: string;
  title: string;
  content: string;
  created_at?: string;
};

export default function TermsPage() {
  const router = useRouter();
  const { version } = router.query;

  const [terms, setTerms] = useState<Terms | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!version) return;

    const fetchTerms = async () => {
      try {
        const res = await fetch(`/api/terms/${version}`);
        const data = await res.json();

        if (res.ok) {
          setTerms(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, [version]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-600">Loading terms...</p>
      </div>
    );
  }

  if (!terms) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-500">Terms not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-900">
          {terms.title}
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Version: {terms.version}
        </p>

        <div className="mt-6 whitespace-pre-wrap text-sm leading-6 text-gray-800">
          {terms.content}
        </div>
      </div>
    </div>
  );
}