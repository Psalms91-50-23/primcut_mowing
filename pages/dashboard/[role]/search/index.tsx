import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type SearchType = "quote" | "job" | "customer";

type JobRecurrence = {
  id: number;
  job_uuid: string;
  scheduled_at: string;
  is_completed: boolean;
  completed_date?: string | null;
  status: string;
  is_deleted: boolean;
};

type SearchCustomer = {
  uuid: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  mobile_phone?: string | null;
  landline_phone?: string | null;
  address?: string | null;
};

type SearchQuote = {
  uuid: string;
  status?: string | null;
  contact_first_name?: string | null;
  contact_last_name?: string | null;
  contact_email?: string | null;
  contact_mobile?: string | null;
  contact_landline?: string | null;
  address?: string | null;
  total_amount?: number | null;
  customer_uuid?: string | null;
};

type SearchJob = {
  uuid: string;
  status?: string | null;
  job_address?: string | null;
  scheduled_at?: string | null;
  total_amount?: number | null;
  quote_uuid?: string | null;
  customer_uuid?: string | null;
  quote?: {
    uuid?: string;
    contact_first_name?: string | null;
    contact_last_name?: string | null;
    contact_email?: string | null;
  } | null;
};

type GlobalSearchResponse = {
  query: string;
  customers: SearchCustomer[];
  quotes: SearchQuote[];
  jobs: SearchJob[];
};

const UUID_REGEX = /^[a-zA-Z0-9]{9}$/;

export default function DeepSearchPage() {
  const router = useRouter();
  const { role } = router.query as { role?: string };
  const { user } = useAuth();

  const roleFromUrl = typeof role === "string" ? role : user?.role;

  const [type, setType] = useState<SearchType>("job");
  const [uuid, setUuid] = useState("");
  const [loading, setLoading] = useState(false);
  const [recurrences, setRecurrences] = useState<JobRecurrence[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [searchValue, setSearchValue] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<GlobalSearchResponse>({
    query: "",
    customers: [],
    quotes: [],
    jobs: [],
  });

  const sortedRecurrences = useMemo(() => {
    return [...recurrences].sort((a, b) => {
      const da = new Date(a.scheduled_at).getTime();
      const db = new Date(b.scheduled_at).getTime();
      return da - db;
    });
  }, [recurrences]);

  const getQuoteRoute = (targetUUID: string) => {
    if (!roleFromUrl) return "/auth";
    return `/dashboard/${roleFromUrl}/quotes/${targetUUID}`;
  };

  const getJobRoute = (targetUUID: string) => {
    return `/employee/jobs/uuid/${targetUUID}`;
  };

  const getCustomerRoute = (targetUUID: string) => {
    if (!roleFromUrl) return "/auth";
    return `/dashboard/${roleFromUrl}/customers/${targetUUID}`;
  };

  const getRoute = (t: SearchType, targetUUID: string) => {
    if (t === "quote") return getQuoteRoute(targetUUID);
    if (t === "job") return getJobRoute(targetUUID);
    return getCustomerRoute(targetUUID);
  };

  const formatPersonName = (first?: string | null, last?: string | null) => {
    return [first, last].filter(Boolean).join(" ").trim() || "Unnamed";
  };

  const formatMoney = (value?: number | null) => {
    return `$${Number(value || 0).toFixed(2)}`;
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return "Not set";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "Not set";
    return d.toLocaleString();
  };

  const handleGo = () => {
    const trimmed = uuid.trim();

    if (!UUID_REGEX.test(trimmed)) {
      alert("UUID must be exactly 9 letters or numbers.");
      return;
    }

    router.push(getRoute(type, trimmed));
  };

  const handlePreview = async () => {
    const trimmed = uuid.trim();
    setError(null);
    setRecurrences([]);

    if (!UUID_REGEX.test(trimmed)) {
      alert("UUID must be exactly 9 letters or numbers.");
      return;
    }

    if (type !== "job") {
      handleGo();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${trimmed}/recurrences`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch job recurrences");
      }

      setRecurrences(data.recurrences || []);
    } catch (e: any) {
      setError(e?.message || "Failed to fetch recurrences");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (rawValue?: string) => {
    const value = (rawValue ?? searchValue).trim();

    setSearchError(null);
    setSearchResults({
      query: value,
      customers: [],
      quotes: [],
      jobs: [],
    });

    if (!value) {
      alert("Enter a search value.");
      return;
    }

    try {
      setSearchLoading(true);

      const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Search failed");
      }

      setSearchResults({
        query: data?.query || value,
        customers: data?.customers || [],
        quotes: data?.quotes || [],
        jobs: data?.jobs || [],
      });

      const currentQuery = typeof router.query.q === "string" ? router.query.q : "";
      if (currentQuery !== value) {
        router.replace(
          {
            pathname: router.pathname,
            query: {
              ...router.query,
              q: value,
            },
          },
          undefined,
          { shallow: true }
        );
      }
    } catch (e: any) {
      setSearchError(e?.message || "Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    if (!router.isReady) return;

    const q = typeof router.query.q === "string" ? router.query.q : "";
    if (!q) return;

    setSearchValue(q);
    handleSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-6xl space-y-6">
        <h1 className="text-3xl font-bold text-green-900">Deep Search</h1>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Global Search</h2>
                <p className="text-sm text-gray-500">
                  Search by name, email, phone, address, or UUID
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2">
                <input
                  type="text"
                  placeholder="john smith, john@email.com, 021..., address..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className="border px-3 py-2 rounded w-full"
                />

                <Button
                  onClick={() => handleSearch()}
                  className="cursor-pointer bg-green-600 text-white hover:bg-green-900"
                  disabled={searchLoading}
                >
                  {searchLoading ? "Searching..." : "Search"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearchValue("");
                    setSearchError(null);
                    setSearchResults({
                      query: "",
                      customers: [],
                      quotes: [],
                      jobs: [],
                    });

                    const nextQuery = { ...router.query };
                    delete nextQuery.q;

                    router.replace(
                      {
                        pathname: router.pathname,
                        query: nextQuery,
                      },
                      undefined,
                      { shallow: true }
                    );
                  }}
                  className="cursor-pointer"
                >
                  Clear
                </Button>
              </div>

              {searchError && <p className="text-red-600 text-sm">{searchError}</p>}

              {!searchError && searchResults.query && (
                <p className="text-sm text-gray-500">
                  Results for: <span className="font-medium">{searchResults.query}</span>
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">UUID Search</h2>
                <p className="text-sm text-gray-500">
                  Open a quote, job, or customer directly by 9-character UUID
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value as SearchType);
                    setRecurrences([]);
                    setError(null);
                  }}
                  className="border px-3 py-2 rounded w-full"
                >
                  <option value="quote">Quote</option>
                  <option value="job">Job</option>
                  <option value="customer">Customer</option>
                </select>

                <input
                  type="text"
                  placeholder="Enter UUID (9 chars)"
                  value={uuid}
                  maxLength={9}
                  onChange={(e) => setUuid(e.target.value)}
                  className="border px-3 py-2 rounded w-full sm:col-span-2"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleGo}
                  className="cursor-pointer bg-green-600 text-white hover:bg-green-900"
                >
                  Go
                </Button>

                <Button
                  variant="outline"
                  onClick={handlePreview}
                  className="cursor-pointer hover:bg-green-900 hover:text-white"
                  disabled={loading}
                >
                  {type === "job" ? "Preview Recurrences" : "Preview"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setUuid("");
                    setRecurrences([]);
                    setError(null);
                  }}
                  className="cursor-pointer bg-red-500 text-white hover:bg-red-800 hover:text-white"
                >
                  Clear
                </Button>

                <Button
                  variant="outline"
                  onClick={() => router.push(`/dashboard/${roleFromUrl || "owner"}`)}
                >
                  Back
                </Button>
              </div>

              {error && <p className="text-red-600 text-sm">{error}</p>}
            </CardContent>
          </Card>

          
        </div>

        {type === "job" && (loading || sortedRecurrences.length > 0) && (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Job Recurrences</h2>

              {loading ? (
                <p className="text-gray-600">Loading recurrences...</p>
              ) : sortedRecurrences.length === 0 ? (
                <p className="text-gray-600">
                  No occurrences found (job may not be recurring yet).
                </p>
              ) : (
                <div className="space-y-2">
                  {sortedRecurrences.map((r) => (
                    <div
                      key={r.id}
                      className="border rounded-lg p-3 bg-white shadow-sm flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">
                          {new Date(r.scheduled_at).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: {r.status} {r.is_completed ? "• Completed" : ""}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-500">Occurrence ID</p>
                        <p className="font-mono text-sm">{r.id}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {(searchLoading ||
          searchResults.customers.length > 0 ||
          searchResults.quotes.length > 0 ||
          searchResults.jobs.length > 0 ||
          (!!searchResults.query && !searchError)) && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <SearchSection
              title="Customers"
              count={searchResults.customers.length}
              emptyText="No customers found."
            >
              {searchLoading ? (
                <p className="text-sm text-gray-500">Searching customers...</p>
              ) : searchResults.customers.length === 0 ? (
                <p className="text-sm text-gray-500">No customers found.</p>
              ) : (
                <div className="space-y-2">
                  {searchResults.customers.map((customer) => (
                    <Card
                      key={customer.uuid}
                      className="cursor-pointer hover:shadow-lg transition"
                      onClick={() => router.push(getCustomerRoute(customer.uuid))}
                    >
                      <CardContent className="p-4">
                        <p className="font-semibold text-gray-900">
                          {formatPersonName(customer.first_name, customer.last_name)}
                        </p>
                        <p className="text-sm text-gray-500">{customer.email || "-"}</p>
                        <p className="text-sm text-gray-500">
                          {customer.mobile_phone || customer.landline_phone || "-"}
                        </p>
                        <p className="text-sm text-gray-500">{customer.address || "-"}</p>
                        <p className="p-1 rounded-lg bg-emerald-50 border border-emerald-500 text-xs text-emerald-700 mt-1">UUID: {customer.uuid}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </SearchSection>

            <SearchSection
              title="Quotes"
              count={searchResults.quotes.length}
              emptyText="No quotes found."
            >
              {searchLoading ? (
                <p className="text-sm text-gray-500">Searching quotes...</p>
              ) : searchResults.quotes.length === 0 ? (
                <p className="text-sm text-gray-500">No quotes found.</p>
              ) : (
                <div className="space-y-2">
                  {searchResults.quotes.map((quote) => (
                    <Card
                      key={quote.uuid}
                      className="cursor-pointer hover:shadow-lg transition"
                      onClick={() => router.push(getQuoteRoute(quote.uuid))}
                    >
                      <CardContent className="p-4">
                        <p className="font-semibold text-gray-900">
                          {formatPersonName(
                            quote.contact_first_name,
                            quote.contact_last_name
                          )}
                        </p>
                        <p className="text-sm text-gray-500">{quote.contact_email || "-"}</p>
                        <p className="text-sm text-gray-500">{quote.address || "-"}</p>
                        <p className="text-sm text-gray-500">Status: {quote.status || "-"}</p>
                        <p className="text-sm text-gray-500">
                          Total: {formatMoney(quote.total_amount)}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <p className="p-1 rounded-lg bg-blue-50 border border-blue-500 text-blue-700 text-xs text-blue-700 mt-1">UUID: {quote.uuid}</p>
                          <p className="p-1 rounded-lg bg-emerald-50 border border-emerald-500 text-emerald-700 text-xs text-emerald-700 mt-1">Customer UUID: {quote.customer_uuid}</p>
                        </div>
                          
                       
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </SearchSection>

            <SearchSection
              title="Jobs"
              count={searchResults.jobs.length}
              emptyText="No jobs found."
            >
              {searchLoading ? (
                <p className="text-sm text-gray-500">Searching jobs...</p>
              ) : searchResults.jobs.length === 0 ? (
                <p className="text-sm text-gray-500">No jobs found.</p>
              ) : (
                <div className="space-y-2">
                  {searchResults.jobs.map((job) => (
                    <Card
                      key={job.uuid}
                      className="cursor-pointer hover:shadow-lg transition"
                      onClick={() => router.push(getJobRoute(job.uuid))}
                    >
                      <CardContent className="p-4">
                        <p className="font-semibold text-gray-900">
                          {formatPersonName(
                            job.quote?.contact_first_name,
                            job.quote?.contact_last_name
                          )}
                        </p>
                        <p className="text-sm text-gray-500">{job.job_address || "-"}</p>
                        <p className="text-sm text-gray-500">Status: {job.status || "-"}</p>
                        <p className="text-sm text-gray-500">
                          Scheduled: {formatDateTime(job.scheduled_at)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">UUID: {job.uuid}</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <p className="px-2 py-1 rounded-lg bg-blue-50 border border-blue-500 text-blue-700 text-xs">
                            Quote UUID: {job.quote_uuid}
                          </p>

                          <p className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-500 text-emerald-700 text-xs">
                            Customer UUID: {job.customer_uuid}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </SearchSection>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchSection({
  title,
  count,
  emptyText,
  children,
}: {
  title: string;
  count: number;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <span className="text-xs text-gray-500">
            {count} result{count === 1 ? "" : "s"}
          </span>
        </div>

        {children || <p className="text-sm text-gray-500">{emptyText}</p>}
      </CardContent>
    </Card>
  );
}