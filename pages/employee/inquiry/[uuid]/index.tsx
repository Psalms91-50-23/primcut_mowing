import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { formatFullName } from "@/utils/utils";

export default function InquiryDetail() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { uuid } = router.query;

  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState("");
  const [inquiry, setInquiry] = useState<any>(null);

  const [replyMessage, setReplyMessage] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replySuccess, setReplySuccess] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    if (authLoading) return;

    if (!user) {
      router.replace(`/auth?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    if (!uuid || typeof uuid !== "string") return;

    const fetchInquiry = async () => {
      try {
        setPageLoading(true);
        setError("");

        const res = await fetch(`/api/inquiry/${uuid}`, {
          method: "GET",
          credentials: "include",
        });

        const result = await res.json().catch(() => null);
        console.log("fetch inquiry result:", result);

        if (!res.ok) {
          throw new Error(
            result?.details ||
              result?.error ||
              `Failed to fetch inquiry (${res.status})`
          );
        }

        setInquiry(result?.inquiry || null);
      } catch (err: any) {
        console.error("Fetch inquiry error:", err);
        setError(err?.message || "Something went wrong");
      } finally {
        setPageLoading(false);
      }
    };

    fetchInquiry();
  }, [uuid, user, router.isReady, authLoading, router.asPath]);

  const handleReply = async () => {
    if (!uuid || typeof uuid !== "string") return;

    const trimmedMessage = replyMessage.trim();

    if (!trimmedMessage) {
      setReplyError("Please enter a reply message.");
      setReplySuccess("");
      return;
    }

    try {
      setReplySending(true);
      setReplyError("");
      setReplySuccess("");

      const res = await fetch(`/api/inquiry/${uuid}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          reply_message: trimmedMessage,
          recipient_email: inquiry?.email || "",
          reply_subject: `Re: Inquiry ID: ${inquiry?.uuid || uuid}`,
        }),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(
          result?.details ||
            result?.error ||
            `Failed to send reply (${res.status})`
        );
      }

      setReplySuccess("Reply sent successfully.");
      setReplyMessage("");

      if (result?.inquiry) {
        setInquiry(result.inquiry);
      }
    } catch (err: any) {
      console.error("Send reply error:", err);
      setReplyError(err?.message || "Failed to send reply");
    } finally {
      setReplySending(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleString("en-NZ", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const fullName = formatFullName(inquiry?.first_name, inquiry?.last_name, false) || "Unknown";

  const services = Array.isArray(inquiry?.services)
    ? inquiry.services
    : inquiry?.service
      ? [inquiry.service]
      : [];

  const hasEmail = Boolean(inquiry?.email);
  const hasPhone = Boolean(inquiry?.phone);

  const formattedStatus = useMemo(() => {
    if (!inquiry?.status) return "N/A";
    return String(inquiry.status)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [inquiry?.status]);

  if (authLoading || pageLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 border-4 border-green-700 border-t-transparent border-solid rounded-full animate-spin"></div>
          <p className="text-gray-700 text-base font-medium">Loading ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="w-full max-w-lg bg-white border border-red-200 rounded-2xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Unable to load inquiry</h1>
          <p className="mt-3 text-gray-600">{error}</p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 cursor-pointer hover:bg-gray-100 transition"
            >
              Back
            </button>
            <button
              onClick={() => router.reload()}
              className="px-5 py-2.5 rounded-lg bg-green-700 text-white hover:bg-green-800 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Inquiry not found</h1>
          <p className="mt-3 text-gray-600">
            The inquiry you are looking for does not exist or may have been removed.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-6 px-5 py-2.5 rounded-lg bg-green-700 text-white hover:bg-green-800 transition"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="sticky top-20 z-50 mb-8">
          <div className="w-full rounded-2xl border border-white/10 bg-white/55 backdrop-blur-md shadow-lg px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-green-700 uppercase tracking-[0.18em]">
                Inquiry Details
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-gray-900 truncate">
                {fullName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                <span>Inquiry ID: {inquiry?.uuid || uuid}</span>
                {inquiry?.status && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1">
                    {formattedStatus}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {hasPhone && (
                <a
                  href={`tel:${inquiry.phone}`}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-green-700 text-white font-semibold shadow-sm hover:bg-green-800 transition"
                >
                  Call Customer
                </a>
              )}

              <button
                onClick={() => router.back()}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-gray-300 bg-white/90 text-gray-700 font-medium cursor-pointer hover:bg-white transition"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Customer Message</h2>
                <span className="text-xs text-gray-500">
                  Received {formatDate(inquiry?.created_at)}
                </span>
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-200 p-5">
                <p className="text-gray-700 whitespace-pre-line leading-7">
                  {inquiry?.message || "No message provided."}
                </p>
              </div>
            </div>

            {services.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Requested Services
                </h2>

                <div className="flex flex-wrap gap-2">
                  {services.map((service: string, index: number) => (
                    <span
                      key={`${service}-${index}`}
                      className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-sm font-medium px-3 py-1.5"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-5">Reply to Customer</h2>

              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Replying to email
                    </p>
                    <p className="mt-2 text-sm text-gray-900 break-all">
                      {inquiry?.email || "No email available"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Phone contact
                    </p>
                    <div className="mt-2">
                      {hasPhone ? (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <p className="text-sm text-gray-900 break-all">
                            {inquiry.phone}
                          </p>
                          <a
                            href={`tel:${inquiry.phone}`}
                            className="inline-flex items-center justify-center rounded-lg bg-white border border-green-300 px-3 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 transition w-full sm:w-auto"
                          >
                            Call now
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No phone number available</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="replyMessage"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="replyMessage"
                    value={replyMessage}
                    onChange={(e) => {
                      setReplyMessage(e.target.value);
                      if (replyError) setReplyError("");
                      if (replySuccess) setReplySuccess("");
                    }}
                    rows={8}
                    placeholder="Write your reply here..."
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:border-green-700"
                    disabled={replySending || !hasEmail}
                  />
                </div>

                {replyError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {replyError}
                  </div>
                )}

                {replySuccess && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 font-semibold">
                    {replySuccess}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleReply}
                    disabled={replySending || !hasEmail}
                    className="inline-flex items-center justify-center rounded-lg bg-green-700 px-5 py-2.5 text-white font-semibold hover:cursor-pointer hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {replySending ? "Sending..." : "Reply to Email"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReplyMessage("");
                      setReplyError("");
                      setReplySuccess("");
                    }}
                    disabled={replySending}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-gray-700 font-semibold hover:cursor-pointer hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>

                  {hasPhone && (
                    <a
                      href={`tel:${inquiry.phone}`}
                      className="inline-flex items-center justify-center rounded-lg border border-green-300 bg-white px-5 py-2.5 text-green-700 font-semibold hover:bg-green-50 transition sm:ml-auto"
                    >
                      Call Customer
                    </a>
                  )}
                </div>
              </div>
            </div>

            {Array.isArray(inquiry?.images) && inquiry.images.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Images</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {inquiry.images.map((image: string, index: number) => (
                    <a
                      key={index}
                      href={image}
                      target="_blank"
                      rel="noreferrer"
                      className="block group"
                    >
                      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm">
                        <img
                          src={image}
                          alt={`Inquiry image ${index + 1}`}
                          className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Info</h2>

              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Full Name
                  </p>
                  <p className="mt-1 text-gray-900 font-medium">{fullName}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Email
                  </p>
                  {hasEmail ? (
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="mt-1 block text-green-700 hover:underline break-all"
                    >
                      {inquiry.email}
                    </a>
                  ) : (
                    <p className="mt-1 text-gray-500">N/A</p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Phone
                  </p>
                  {hasPhone ? (
                    <div className="mt-1 space-y-2">
                      <a
                        href={`tel:${inquiry.phone}`}
                        className="block text-gray-900"
                      >
                        {inquiry.phone}
                      </a>
                      <a
                        href={`tel:${inquiry.phone}`}
                        className="inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 transition w-full"
                      >
                        Call Customer
                      </a>
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-500">N/A</p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Inquiry Info</h2>

              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Inquiry UUID
                  </p>
                  <p className="mt-1 text-sm text-gray-900 break-all">
                    {inquiry?.uuid || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Created At
                  </p>
                  <p className="mt-1 text-gray-900">
                    {formatDate(inquiry?.created_at)}
                  </p>
                </div>

                {inquiry?.status && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </p>
                    <p className="mt-1">
                      <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1.5">
                        {formattedStatus}
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>

              <div className="space-y-3">
                {hasPhone ? (
                  <a
                    href={`tel:${inquiry.phone}`}
                    className="w-full inline-flex items-center justify-center rounded-lg bg-green-700 px-4 py-2.5 text-white font-semibold hover:bg-green-800 transition"
                  >
                    Call Customer
                  </a>
                ) : (
                  <p className="text-sm text-gray-500 text-left">
                    No phone number available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}