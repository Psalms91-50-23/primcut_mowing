import { useState } from "react";
import { useRouter } from "next/router";

type FormState = {
  version: string;
  title: string;
  short_summary: string;
  content: string;
  pdf_url: string;
  is_active: boolean;
};

export default function NewTermsPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    version: "",
    title: "",
    short_summary: "",
    content: "",
    pdf_url: "",
    is_active: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const updateField = (
    key: keyof FormState,
    value: string | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/admin/terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          credentials: "include",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to create terms and conditions");
      }

      setSuccessMsg("Terms and conditions created successfully.");

      setForm({
        version: "",
        title: "",
        short_summary: "",
        content: "",
        pdf_url: "",
        is_active: false,
      });

      // optional redirect:
      // router.push("/admin/terms");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Create Terms & Conditions
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          Create a new version of your terms and conditions for quotes and customers.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Version
              </label>
              <input
                type="text"
                value={form.version}
                onChange={(e) => updateField("version", e.target.value)}
                placeholder="e.g. v1.0"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Terms and Conditions"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Short Summary
            </label>
            <textarea
              value={form.short_summary}
              onChange={(e) => updateField("short_summary", e.target.value)}
              placeholder="Short explanation shown in quote or email"
              rows={3}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              value={form.content}
              onChange={(e) => updateField("content", e.target.value)}
              placeholder="Full terms and conditions text"
              rows={16}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 font-mono text-sm outline-none focus:border-black"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              PDF URL
            </label>
            <input
              type="text"
              value={form.pdf_url}
              onChange={(e) => updateField("pdf_url", e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional for now. Later this can come from uploaded/generated PDF.
            </p>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => updateField("is_active", e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm text-gray-700">
              Set this version as active
            </span>
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:cursor-pointer disabled:opacity-60"
            >
              {loading ? "Saving..." : "Create Terms"}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}