import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";

type TermsData = {
  version?: string;
  title?: string;
  content?: string;
  short_summary?: string;
  pdf_url?: string;
  effective_date?: string;
};

type PageProps = {
  initialTerms: TermsData | null;
  initialError: string;
  shouldRetry: boolean;
};

export default function TermsAndConditionsPage({
  initialTerms,
  initialError,
  shouldRetry,
}: PageProps) {
  const router = useRouter();
  const [terms, setTerms] = useState<TermsData | null>(initialTerms);
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(!initialTerms && shouldRetry);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!shouldRetry || initialTerms) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 12; // about 60 seconds if interval is 5 sec

    const fetchTerms = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/terms-and-conditions/latest");
        const data = await res.json();

        if (!res.ok) {
          // Keep retrying only for server/unavailable type errors
          const message = data?.error || "Failed to load terms and conditions.";

          // If backend is awake and explicitly says no active terms, stop retrying
          if (
            message.toLowerCase().includes("no active terms") ||
            message.toLowerCase().includes("not found")
          ) {
            if (!cancelled) {
              setTerms(null);
              setError("No active terms and conditions found.");
              setLoading(false);
            }
            return;
          }

          throw new Error(message);
        }

        if (!cancelled) {
          setTerms(data);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        attempts += 1;
        if (!cancelled) {
          setRetryCount(attempts);
        }

        if (attempts >= maxAttempts) {
          if (!cancelled) {
            setError(
              "Unable to load terms and conditions right now. Please refresh in a moment."
            );
            setLoading(false);
          }
          return;
        }

        setTimeout(fetchTerms, 5000);
      }
    };

    fetchTerms();

    return () => {
      cancelled = true;
    };
  }, [shouldRetry, initialTerms]);

  return (
    <>
      <Head>
        <title>Terms and Conditions</title>
        <meta
          name="description"
          content="Read the latest terms and conditions."
        />
      </Head>

      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-4xl">
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
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-6 md:px-10">
              <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Legal
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Terms and Conditions
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Please review the current terms and conditions below.
              </p>
            </div>

            <div className="px-6 py-6 md:px-10 md:py-8">
              {loading && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                    <div>
                      <p className="font-medium text-slate-800">
                        Starting server and loading terms...
                      </p>
                      <p className="text-xs text-slate-500">
                        This can take a little longer if the backend is waking up.
                        {retryCount > 0 ? ` Retry ${retryCount}...` : ""}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!loading && error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {!loading && !error && terms && (
                <div className="space-y-8">
                  <div className="space-y-3">
                    {terms.title && (
                      <h2 className="text-2xl font-semibold text-slate-900">
                        {terms.title}
                      </h2>
                    )}

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                      {terms.version && (
                        <span>
                          <span className="font-medium text-slate-700">
                            Version:
                          </span>{" "}
                          {terms.version}
                        </span>
                      )}

                      {terms.effective_date && (
                        <span>
                          <span className="font-medium text-slate-700">
                            Effective date:
                          </span>{" "}
                          {terms.effective_date}
                        </span>
                      )}
                    </div>
                  </div>

                  {terms.short_summary && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-900">
                        Summary
                      </h3>

                      <div className="mt-3 space-y-3 text-sm leading-7 text-amber-800">
                        {(() => {
                          const lines = terms.short_summary
                            .split("\n")
                            .map((line) => line.trim())
                            .filter(Boolean);

                          const elements: JSX.Element[] = [];
                          let bulletBuffer: string[] = [];

                          const flushBullets = (key: number) => {
                            if (bulletBuffer.length > 0) {
                              elements.push(
                                <ul
                                  key={`ul-${key}`}
                                  className="ml-5 list-disc space-y-1"
                                >
                                  {bulletBuffer.map((item, i) => (
                                    <li key={i}>{item}</li>
                                  ))}
                                </ul>
                              );
                              bulletBuffer = [];
                            }
                          };

                          lines.forEach((line, index) => {
                            if (line.startsWith("* ")) {
                              bulletBuffer.push(line.replace(/^\*\s*/, ""));
                            } else {
                              flushBullets(index);
                              elements.push(<p key={`p-${index}`}>{line}</p>);
                            }
                          });

                          flushBullets(lines.length);

                          return elements;
                        })()}
                      </div>
                    </div>
                  )}
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
                      {terms.content}
                    </ReactMarkdown>
                  </div>
                  {/* {terms.content && (
                    <article className="prose prose-slate max-w-none whitespace-pre-line">
                      {terms.content}
                    </article>
                  )} */}

                  {terms.pdf_url && (
                    <div className="pt-2">
                      <a
                        href={terms.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        View PDF Version
                      </a>
                    </div>
                  )}
                </div>
              )}

              {!loading && !error && !terms && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  No active terms and conditions are currently available.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps(context: any) {
  try {
    const protocol =
      process.env.NODE_ENV === "development" ? "http" : "https";

    const host = context.req.headers.host;
    const cookie = context.req.headers.cookie || "";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `${protocol}://${host}/api/terms-and-conditions/latest`,
      {
        headers: { cookie },
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    const data: TermsData & { error?: string } = await response.json();

    if (!response.ok) {
      return {
        props: {
          initialTerms: null,
          initialError: "",
          shouldRetry: true,
        },
      };
    }

    return {
      props: {
        initialTerms: data,
        initialError: "",
        shouldRetry: false,
      },
    };
  } catch (error) {
    console.error("Error prefetching terms and conditions:", error);

    return {
      props: {
        initialTerms: null,
        initialError: "",
        shouldRetry: true,
      },
    };
  }
}