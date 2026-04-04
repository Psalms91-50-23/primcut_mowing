import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth, roleRedirectMap } from "../../../context/AuthContext";
import { formatFullName } from "@/utils/utils";
import { Search, ArrowLeft, MessageSquareMore, Filter } from "lucide-react";

type Inquiry = {
  uuid: string;
  customer_uuid?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  mobile?: string | null;
  address?: string | null;
  message?: string | null;
  services?: string[] | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type InquiriesResponse = {
  inquiries?: Inquiry[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  error?: string;
};

const PAGE_SIZE = 12;

export default function OwnerInquiriesPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchValue, setSearchValue] = useState("");

  const formatDateTime = (iso?: string | null) => {
    if (!iso) return "Not set";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "Not set";
    return d.toLocaleString("en-NZ", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getInquiryStatusBadge = (status?: string | null) => {
    const s = (status || "").toLowerCase();

    if (s === "new") {
      return {
        label: "New",
        className: "bg-blue-100 text-blue-900 border-blue-200",
      };
    }

    if (s === "in_progress" || s === "in-progress") {
      return {
        label: "In Progress",
        className: "bg-yellow-100 text-yellow-900 border-yellow-200",
      };
    }

    if (s === "resolved" || s === "completed") {
      return {
        label: "Resolved",
        className: "bg-emerald-100 text-emerald-900 border-emerald-200",
      };
    }

    if (s === "contacted") {
      return {
        label: "Contacted",
        className: "bg-purple-100 text-purple-900 border-purple-200",
      };
    }

    if (s === "closed") {
      return {
        label: "Closed",
        className: "bg-gray-200 text-gray-900 border-gray-300",
      };
    }

    return {
      label: status || "Unknown",
      className: "bg-gray-100 text-gray-900 border-gray-200",
    };
  };

  const fetchInquiries = async ({
    pageNumber = 1,
    status = "all",
  }: {
    pageNumber?: number;
    status?: string;
  }) => {
    try {
      setFetching(true);

      const params = new URLSearchParams();
      params.set("page", String(pageNumber));
      params.set("limit", String(PAGE_SIZE));

      if (status && status !== "all") {
        params.set("status", status);
      }

      const res = await fetch(`/api/inquiries?${params.toString()}`);
      const data: InquiriesResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch inquiries");
      }

      setInquiries(data.inquiries || []);
      setTotal(Number(data.total || 0));
      setPage(Number(data.page || pageNumber));
      setTotalPages(Number(data.totalPages || 1));
    } catch (err) {
      console.error("Failed to fetch inquiries:", err);
      setInquiries([]);
      setTotal(0);
      setPage(1);
      setTotalPages(1);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);

      if (!user) {
        router.replace("/auth");
        return;
      }

      if (user.role !== "owner") {
        router.replace(roleRedirectMap[user.role] || "/");
        return;
      }

      try {
        await fetchInquiries({
          pageNumber: 1,
          status: statusFilter,
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "owner") return;

    fetchInquiries({
      pageNumber: 1,
      status: statusFilter,
    });
  }, [statusFilter]);

  const filteredInquiries = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    if (!term) return inquiries;

    return inquiries.filter((inquiry) => {
      const fullName = formatFullName(
        inquiry.first_name ?? undefined,
        inquiry.last_name ?? undefined,
        true
      ).toLowerCase();

      const fields = [
        inquiry.uuid,
        inquiry.first_name,
        inquiry.last_name,
        fullName,
        inquiry.email,
        inquiry.phone,
        inquiry.mobile,
        inquiry.address,
        inquiry.message,
        inquiry.status,
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());

      return fields.some((value) => value.includes(term));
    });
  }, [inquiries, searchValue]);

  const handleSearchKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  const handleOpenInquiry = (uuid: string) => {
    router.push(`/employee/inquiry/${uuid}`);
  };

  const handlePreviousPage = async () => {
    if (page <= 1 || fetching) return;

    await fetchInquiries({
      pageNumber: page - 1,
      status: statusFilter,
    });
  };

  const handleNextPage = async () => {
    if (page >= totalPages || fetching) return;

    await fetchInquiries({
      pageNumber: page + 1,
      status: statusFilter,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-700 border-solid" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/45 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-green-900">
                  All Inquiries
                </h1>
                <p className="text-sm text-gray-600">
                  View and manage all customer inquiries
                </p>
              </div>

              <div className="w-full lg:w-auto lg:shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full lg:w-auto cursor-pointer border-green-200 bg-white text-green-900 hover:bg-green-50 hover:text-green-900 shadow-sm lg:self-start"
                  onClick={() => router.push("/dashboard/owner")}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </div>
            </div>

            <Card className="rounded-2xl shadow-sm border-gray-200 ">
              <CardContent className="p-4 sm:p-5">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-3">
                  <div className="relative">
                    <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search inquiry UUID, name, email, phone, address, or message..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyDown={handleSearchKeyDown}
                      className="w-full rounded-lg border bg-white pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-200"
                    />
                  </div>

                  <div className="relative">
                    <Filter className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full rounded-lg border bg-white pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-green-200 cursor-pointer appearance-none"
                    >
                      <option value="all">All statuses</option>
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <p className="text-xs text-gray-500">
                    {fetching
                      ? "Loading inquiries..."
                      : `${total} total inquiry${total === 1 ? "" : "ies"}`}
                  </p>

                  {searchValue.trim() ? (
                    <p className="text-xs text-gray-500">
                      Showing {filteredInquiries.length} result
                      {filteredInquiries.length === 1 ? "" : "s"} on this page
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {fetching && inquiries.length === 0 ? (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-8 text-center text-gray-500">
              Loading inquiries...
            </CardContent>
          </Card>
        ) : filteredInquiries.length === 0 ? (
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-8 text-center">
              <MessageSquareMore className="h-10 w-10 mx-auto text-gray-300 mb-3" />
              <h2 className="text-lg font-semibold text-gray-900">No inquiries found</h2>
              <p className="text-sm text-gray-500 mt-1">
                {searchValue.trim()
                  ? "No inquiries matched your search on this page."
                  : "There are no inquiries to display right now."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredInquiries.map((inquiry) => {
              const badge = getInquiryStatusBadge(inquiry.status);
              const name =
                formatFullName(
                  inquiry.first_name ?? undefined,
                  inquiry.last_name ?? undefined,
                  true
                ) || "Unnamed inquiry";

              const contactLine =
                inquiry.mobile || inquiry.phone || inquiry.email || "No contact details";

              return (
                <Card
                  key={inquiry.uuid}
                  className="rounded-2xl shadow-sm cursor-pointer hover:shadow-md transition"
                  onClick={() => handleOpenInquiry(inquiry.uuid)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h2 className="text-lg font-semibold text-gray-900 truncate">
                            {name}
                          </h2>

                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>

                        <p className="text-xs text-gray-400 mb-2">
                          UUID: {inquiry.uuid}
                        </p>

                        <div className="space-y-1">
                          <p className="text-sm text-gray-600 truncate">{contactLine}</p>

                          {inquiry.email && (
                            <p className="text-sm text-gray-500 truncate">
                              {inquiry.email}
                            </p>
                          )}

                          {inquiry.address && (
                            <p className="text-sm text-gray-500 truncate">
                              {inquiry.address}
                            </p>
                          )}
                        </div>

                        {inquiry.message && (
                          <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                            {inquiry.message}
                          </p>
                        )}

                        {Array.isArray(inquiry.services) && inquiry.services.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {inquiry.services.slice(0, 4).map((service, index) => (
                              <span
                                key={`${inquiry.uuid}-${service}-${index}`}
                                className="text-xs bg-green-50 text-green-800 border border-green-100 px-2 py-1 rounded-full"
                              >
                                {service}
                              </span>
                            ))}

                            {inquiry.services.length > 4 && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                +{inquiry.services.length - 4} more
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <p className="text-xs text-gray-400">
                            Created: {formatDateTime(inquiry.created_at)}
                          </p>

                          <Button
                            type="button"
                            variant="outline"
                            className="cursor-pointer w-full sm:w-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenInquiry(inquiry.uuid);
                            }}
                          >
                            Open Inquiry
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="mt-6">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-gray-600">
                Page <span className="font-semibold">{page}</span> of{" "}
                <span className="font-semibold">{Math.max(totalPages, 1)}</span>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="cursor-pointer"
                  disabled={page <= 1 || fetching}
                  onClick={handlePreviousPage}
                >
                  Previous
                </Button>

                <Button
                  type="button"
                  className="bg-green-600 text-white hover:bg-green-800 cursor-pointer"
                  disabled={page >= totalPages || fetching}
                  onClick={handleNextPage}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}