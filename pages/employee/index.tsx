import React, { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Users, FileText, DollarSign } from "lucide-react";
import { useAuth, roleRedirectMap } from "../../context/AuthContext";
import { useRouter } from "next/router";
import { useRoleRedirect } from "@/hooks/useRoleRedirect";
import { formatFullName } from "@/utils/utils";

type EmployeeFormType = {
  jobTitle: string;
  department: string;
  bankAccount: string;
  irdNumber: string;
  taxCode: string;
  emergencyFirstName: string;
  emergencyLastName: string;
  emergencyPhone: string;
  hireDate: string;
};

type QuickFindType = "quote" | "job" | "customer";

export default function EmployeeDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("employee");

  // ✅ Quick Find state
  const [quickFindType, setQuickFindType] = useState<QuickFindType>("quote");
  const [quickFindValue, setQuickFindValue] = useState("");

  // Pagination & quotes state
  const [draftQuotes, setDraftQuotes] = useState<any[]>([]);
  const [sentQuotes, setSentQuotes] = useState<any[]>([]);
  const [expiredQuotes, setExpiredQuotes] = useState<any[]>([]);
  const [draftPage, setDraftPage] = useState(1);
  const [sentPage, setSentPage] = useState(1);
  const [draftTotalPages, setDraftTotalPages] = useState(1);
  const [sentTotalPages, setSentTotalPages] = useState(1);
  const [fetchingDrafts, setFetchingDrafts] = useState(false);
  const [fetchingSent, setFetchingSent] = useState(false);
  const [limit, setLimit] = useState<number>(0);
  const [daysOld, setDaysOld] = useState<number>(0);

  useRoleRedirect("employee");

  // ✅ Quick Find logic (your public UUID is 9 chars)
  const UUID_REGEX = /^[a-zA-Z0-9]{9}$/;

  const getQuickFindRoute = (type: QuickFindType, uuid: string) => {
    if (type === "quote") return `/dashboard/employee/quotes/${uuid}`;
    if (type === "job") return `/dashboard/employee/jobs/${uuid}`;
    return `/dashboard/employee/customers/${uuid}`;
  };

  const handleQuickFind = () => {
    const uuid = quickFindValue.trim();

    if (!uuid) {
      alert("Enter a UUID.");
      return;
    }

    if (!UUID_REGEX.test(uuid)) {
      alert("UUID must be exactly 9 letters or numbers.");
      return;
    }

    router.push(getQuickFindRoute(quickFindType, uuid));
  };

  const handleQuickFindKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    e
  ) => {
    if (e.key === "Enter") handleQuickFind();
  };

  // -----------------------
  // Initial load
  // -----------------------
  useEffect(() => {
    setLoading(true); // page-level spinner
    if (!user) {
      router.replace("/auth");
      return;
    }

    if (user.role !== "owner") {
      const redirectPath = roleRedirectMap[user.role] || "/";
      router.replace(redirectPath);
      return;
    }

    let tempFullName = formatFullName(user.first_name, user.last_name, false);
    setFullName(tempFullName);
    setLoading(false);

    // Fetch quotes
    fetchExpiredQuotes(3);
    fetchDraftQuotes(1, 10);
    fetchSentQuotes(1, 10);
    setLoading(false);
  }, [user]);

  // -----------------------
  // Fetch quotes functions
  // -----------------------
  const fetchDraftQuotes = async (
    pageNumber: number,
    quoteLimit?: number,
    lengthOfDays?: number
  ) => {
    if (fetchingDrafts || pageNumber > draftTotalPages) return;
    setFetchingDrafts(true);
    try {
      const res = await fetch(
        `/api/quotes?status=draft&limit=${quoteLimit}&page=${pageNumber}&olderThan=${lengthOfDays}`
      );
      if (!res.ok) throw new Error("Failed to fetch draft quotes");
      const data = await res.json();

      setDraftQuotes((prev) => [...prev, ...data.quotes]);
      setDraftPage(data.page);
      setDraftTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingDrafts(false);
    }
  };

  const fetchSentQuotes = async (
    pageNumber: number,
    quoteLimit?: number,
    lengthOfDays?: number
  ) => {
    if (fetchingSent || pageNumber > sentTotalPages) return;
    setFetchingSent(true);

    try {
      const res = await fetch(
        `/api/quotes?status=sent&limit=${quoteLimit}&page=${pageNumber}&olderThan=${lengthOfDays}`
      );
      if (!res.ok) throw new Error("Failed to fetch sent quotes");
      const data = await res.json();

      setSentQuotes((prev) => [...prev, ...data.quotes]);
      setSentPage(data.page);
      setSentTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingSent(false);
    }
  };

  const fetchExpiredQuotes = async (lengthOfDays: number = 7) => {
    try {
      const res = await fetch(
        `/api/quotes?status=expired&olderThan=${lengthOfDays}`
      );
      const data = await res.json();

      if (!res.ok)
        throw new Error(data.error || "Failed to fetch expired quotes");
      setExpiredQuotes(data.quotes || []);
    } catch (err: any) {
      console.error("Error fetching expired quotes:", err.message || err);
      setExpiredQuotes([]);
    }
  };

  // -----------------------
  // Invite user
  // -----------------------
  const handleInviteUser = async () => {
    if (!inviteEmail) return alert("Enter an email");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/invite`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
        }
      );
      if (!res.ok) throw new Error("Failed to send invite");
      alert(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      setInviteRole("employee");
    } catch (err) {
      console.error(err);
      alert("Error sending invite");
    }
  };

  const getQuoteURL = (quoteUUID: string) =>
    `/dashboard/${user?.role}/quotes/${quoteUUID}`;

  // -----------------------
  // Infinite scroll handlers
  // -----------------------
  const draftContainerRef = useRef<HTMLDivElement>(null);
  const sentContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (draftContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        draftContainerRef.current;
      if (
        scrollTop + clientHeight >= scrollHeight - 50 &&
        draftPage < draftTotalPages
      ) {
        fetchDraftQuotes(draftPage + 1, limit);
      }
    }

    if (sentContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        sentContainerRef.current;
      if (
        scrollTop + clientHeight >= scrollHeight - 50 &&
        sentPage < sentTotalPages
      ) {
        fetchSentQuotes(sentPage + 1, limit);
      }
    }
  }, [draftPage, draftTotalPages, sentPage, sentTotalPages, limit]);

  useEffect(() => {
    const draftDiv = draftContainerRef.current;
    const sentDiv = sentContainerRef.current;

    draftDiv?.addEventListener("scroll", handleScroll);
    sentDiv?.addEventListener("scroll", handleScroll);

    return () => {
      draftDiv?.removeEventListener("scroll", handleScroll);
      sentDiv?.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600 text-lg">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-green-900">
            Owner Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back {fullName} <span className="wave text-3xl">👋</span>
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/owner/settings")}
          className="bg-green-700 text-white hover:bg-green-800"
        >
          Edit Employee Details
        </Button>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Active Jobs" value="12" icon={<Calendar />} />
        <StatCard title="Customers" value="84" icon={<Users />} />
        <StatCard title="Quotes Sent" value="27" icon={<FileText />} />
        <StatCard title="Revenue (MTD)" value="$4,320" icon={<DollarSign />} />
      </section>

      {/* Quick Actions + Invite + Quick Find */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Invite */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4 pt-5">Invite User</h2>
            <input
              type="email"
              placeholder="User email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="border px-3 py-2 rounded w-full mb-2"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="border px-3 py-2 rounded w-full mb-2"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
              <option value="owner">Owner</option>
            </select>
            <Button onClick={handleInviteUser} className="cursor-pointer bg-green-600 text-white hover:bg-green-900 hover:text-white">
              Send Invite
            </Button>
          </CardContent>
        </Card>

        {/* Quick Find */}
        <Card className="rounded-2xl shadow-sm">
          <CardContent>
            <div className="flex items-center justify-between gap-3 mb-4 pt-5">
              <h2 className="text-xl font-semibold">Quick Find</h2>
              <Button
                variant="outline"
                className="cursor-pointer hover:bg-green-900 hover:text-white"
                onClick={() => router.push("/dashboard/owner/search")}
              >
                Deep Search
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={quickFindType}
                onChange={(e) =>
                  setQuickFindType(e.target.value as QuickFindType)
                }
                className="border px-3 py-2 rounded w-full"
              >
                <option value="quote">Quote</option>
                <option value="job">Job</option>
                <option value="customer">Customer</option>
              </select>

              <input
                type="text"
                placeholder="Enter UUID..."
                value={quickFindValue}
                maxLength={9}
                onChange={(e) => setQuickFindValue(e.target.value)}
                onKeyDown={handleQuickFindKeyDown}
                className="border px-3 py-2 rounded w-full sm:col-span-2"
              />
            </div>

            <div className="flex gap-2 mt-3">
              <Button onClick={handleQuickFind} className="cursor-pointer bg-green-600 text-white hover:bg-green-900 hover:text-white">
                Go
              </Button>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer bg-red-500 text-white hover:bg-red-800 hover:text-white"
                onClick={() => setQuickFindValue("")}
              >
                Clear
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-3">
              Enter the 9-character UUID to quickly navigate.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Draft Quotes */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">
          Draft Quotes / Awaiting Prices
        </h2>
        <div ref={draftContainerRef} className="max-h-96 overflow-auto space-y-2">
          {draftQuotes.length === 0 ? (
            <p>No draft quotes</p>
          ) : (
            draftQuotes.map((quote) => (
              <Card
                key={quote.uuid}
                className="cursor-pointer hover:shadow-lg transition"
                onClick={() => router.push(getQuoteURL(quote.uuid))}
              >
                <CardContent>
                  <p className="font-semibold">
                    {quote.contact_first_name} {quote.contact_last_name}
                  </p>
                  <p className="text-gray-500">Total: ${quote.total_amount}</p>
                  <p className="text-sm text-gray-400">Status: {quote.status}</p>
                </CardContent>
              </Card>
            ))
          )}
          {fetchingDrafts && (
            <p className="text-gray-500 text-center py-2">
              Loading more drafts...
            </p>
          )}
        </div>
      </section>

      {/* Sent Quotes */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">
          Sent Quotes / Awaiting Customer Reply
        </h2>
        <div ref={sentContainerRef} className="max-h-96 overflow-auto space-y-2">
          {sentQuotes.length === 0 ? (
            <p>No sent quotes</p>
          ) : (
            sentQuotes.map((quote) => (
              <Card
                key={quote.uuid}
                className="cursor-pointer hover:shadow-lg transition"
                onClick={() => router.push(getQuoteURL(quote.uuid))}
              >
                <CardContent>
                  <p className="font-semibold">
                    {quote.contact_first_name} {quote.contact_last_name}
                  </p>
                  <p className="text-gray-500">Total: ${quote.total_amount}</p>
                  <p className="text-sm text-gray-400">Status: {quote.status}</p>
                </CardContent>
              </Card>
            ))
          )}
          {fetchingSent && (
            <p className="text-gray-500 text-center py-2">
              Loading more sent quotes...
            </p>
          )}
        </div>
      </section>

      {/* Expired Quotes */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Expired Quotes</h2>
        {expiredQuotes.length === 0 ? (
          <p>No expired quotes</p>
        ) : (
          expiredQuotes.map((quote) => (
            <Card
              key={quote.uuid}
              className="cursor-pointer hover:shadow-lg transition"
              onClick={() => router.push(getQuoteURL(quote.uuid))}
            >
              <CardContent>
                <p className="font-semibold">
                  {quote.contact_first_name} {quote.contact_last_name}
                </p>
                <p className="text-gray-500">Total: ${quote.total_amount}</p>
                <p className="text-sm text-gray-400">Status: {quote.status}</p>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-green-700">{icon}</div>
      </CardContent>
    </Card>
  );
}