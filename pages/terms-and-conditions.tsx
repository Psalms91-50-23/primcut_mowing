import Head from "next/head";

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
};

export default function TermsAndConditionsPage({
  initialTerms,
  initialError,
}: PageProps) {
  const terms = initialTerms;
  const error = initialError;
  const loading = false;

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
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Loading terms and conditions...
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

                  {terms.content && (
                    <article className="prose prose-slate max-w-none whitespace-pre-line">
                      {terms.content}
                    </article>
                  )}

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
                  No terms and conditions are currently available.
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

    const response = await fetch(
      `${protocol}://${host}/api/terms-and-conditions/latest`,
      {
        headers: {
          cookie,
        },
      }
    );

    const data: TermsData & { error?: string } = await response.json();

    if (!response.ok) {
      return {
        props: {
          initialTerms: null,
          initialError:
            data?.error || "Failed to load terms and conditions.",
        },
      };
    }

    return {
      props: {
        initialTerms: data,
        initialError: "",
      },
    };
  } catch (error: unknown) {
    console.error("Error prefetching terms and conditions:", error);

    return {
      props: {
        initialTerms: null,
        initialError: "Unable to load terms and conditions at this time.",
      },
    };
  }
}