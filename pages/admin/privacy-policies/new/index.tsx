import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import type { GetServerSideProps, GetServerSidePropsContext } from "next";

type FormState = {
  version: string;
  title: string;
  short_summary: string;
  content: string;
  pdf_url: string;
  effective_date: string;
  is_active: boolean;
};

type PrivacyPolicyData = {
  version?: string;
  title?: string;
  content?: string;
  short_summary?: string;
  pdf_url?: string;
  effective_date?: string;
};

type PageProps = {
  initialForm: FormState;
  initialFetchError: string | null;
  existingVersions: string[];
};

function normalizeVersion(version: string) {
  return version.trim().toLowerCase();
}

function getNextVersion(version?: string): string {
  if (!version) return "1.0";

  const trimmed = version.trim();

  const prefixedMatch = trimmed.match(/^v(\d+)(?:\.(\d+))?$/i);
  if (prefixedMatch) {
    const major = Number(prefixedMatch[1]);
    const minor = prefixedMatch[2] !== undefined ? Number(prefixedMatch[2]) : 0;
    return `v${major}.${minor + 1}`;
  }

  const plainMatch = trimmed.match(/^(\d+)(?:\.(\d+))?$/);
  if (plainMatch) {
    const major = Number(plainMatch[1]);
    const minor = plainMatch[2] !== undefined ? Number(plainMatch[2]) : 0;
    return `${major}.${minor + 1}`;
  }

  return "";
}

export default function NewPrivacyPolicyPage({
  initialForm,
  initialFetchError,
  existingVersions,
}: PageProps) {
  const router = useRouter();

  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialFetchError);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const normalizedExistingVersions = useMemo(
    () => existingVersions.map(normalizeVersion),
    [existingVersions]
  );

  const versionAlreadyExists = useMemo(() => {
    return normalizedExistingVersions.includes(normalizeVersion(form.version));
  }, [form.version, normalizedExistingVersions]);

  const updateField = (key: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const suggestNextVersion = () => {
    if (!form.version.trim()) {
      const fallback = getNextVersion(existingVersions[0] || "");
      updateField("version", fallback || "1.0");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const trimmedVersion = form.version.trim();

      if (!trimmedVersion) {
        throw new Error("Version is required");
      }

      if (normalizedExistingVersions.includes(normalizeVersion(trimmedVersion))) {
        throw new Error("This version already exists. Please use a new version number.");
      }

      const payload = {
        ...form,
        version: trimmedVersion,
        title: form.title.trim(),
        content: form.content.trim(),
        effective_date: form.effective_date.trim() || null,
        pdf_url: form.pdf_url.trim() || null,
        short_summary: form.short_summary.trim() || null,
      };

      const res = await fetch("/api/admin/privacy-policy", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to create privacy policy");
      }

      setSuccessMsg("Privacy policy created successfully.");

      const nextSuggestedVersion = getNextVersion(trimmedVersion);

      setForm({
        version: nextSuggestedVersion,
        title: initialForm.title || "",
        short_summary: initialForm.short_summary || "",
        content: initialForm.content || "",
        pdf_url: "",
        effective_date: "",
        is_active: false,
      });

      // router.push("/admin/privacy-policies");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
         <div className="mx-auto max-w-4xl sticky top-20 z-50 flex justify-end bg-white/30 backdrop-blur-md px-4 py-3 mb-4 border-b border-gray-200 shadow-none">
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
      <div className="mx-auto max-w-4xl bg-white p-6 shadow mt-5 rounded-2xl">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Create Privacy Policy
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          Create a new version of your privacy policy for enquiries, quotes,
          customers, and business data handling.
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
                onFocus={suggestNextVersion}
                placeholder="e.g. v1.0"
                className={`w-full rounded-xl border px-4 py-3 outline-none focus:border-black ${
                  versionAlreadyExists
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300"
                }`}
                required
              />
              {versionAlreadyExists && (
                <p className="mt-1 text-xs text-red-600">
                  This version already exists. Please enter a new version.
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Privacy Policy"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                required
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Effective Date
              </label>
              <input
                type="date"
                value={form.effective_date}
                onChange={(e) => updateField("effective_date", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional. Leave blank to use today’s date from the backend or database.
              </p>
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
                Optional for now. Later this can come from uploaded or generated PDF.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Short Summary
            </label>
            <textarea
              value={form.short_summary}
              onChange={(e) => updateField("short_summary", e.target.value)}
              placeholder="Short explanation shown on forms, links, or customer pages"
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
              placeholder="Full privacy policy text"
              rows={16}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 font-mono text-sm outline-none focus:border-black"
              required
            />
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
              disabled={loading || versionAlreadyExists}
              className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white hover:cursor-pointer disabled:opacity-60"
            >
              {loading ? "Saving..." : "Create Privacy Policy"}
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

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context: GetServerSidePropsContext
) => {
  const emptyForm: FormState = {
    version: "",
    title: "",
    short_summary: "",
    content: "",
    pdf_url: "",
    effective_date: "",
    is_active: false,
  };

  try {
    const protocol =
      process.env.NODE_ENV === "development" ? "http" : "https";
    const host = context.req.headers.host;
    const cookie = context.req.headers.cookie || "";

    const [latestResponse, versionsResponse] = await Promise.all([
      fetch(`${protocol}://${host}/api/privacy-policies/latest`, {
        headers: { cookie },
      }),
      fetch(`${protocol}://${host}/api/privacy-policies/versions`, {
        headers: { cookie },
      }),
    ]);

    const latestData: PrivacyPolicyData | null = latestResponse.ok
      ? await latestResponse.json()
      : null;

    const versionsData: { versions?: string[] } | null = versionsResponse.ok
      ? await versionsResponse.json()
      : null;

     
    const existingVersions = Array.isArray(versionsData?.versions)
      ? versionsData.versions
      : latestData?.version
      ? [latestData.version]
      : [];

    const suggestedVersion =
      getNextVersion(existingVersions[0] || latestData?.version || "") || "";
     console.log({ latestData, versionsData, existingVersions, suggestedVersion });
    return {
      props: {
        initialForm: {
          version: suggestedVersion,
          title: latestData?.title || "Privacy Policy",
          short_summary: latestData?.short_summary || "",
          content: latestData?.content || "",
          pdf_url: "",
          effective_date: "",
          is_active: false,
        },
        initialFetchError: null,
        existingVersions,
      },
    };
  } catch (error) {
    console.error("Error preloading latest privacy policy:", error);

    return {
      props: {
        initialForm: emptyForm,
        initialFetchError: null,
        existingVersions: [],
      },
    };
  }
};