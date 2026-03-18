// pages/dashboard/[role]/customers/[uuid].tsx
// ✅ Matches your DB columns:
// - mobile_phone
// - landline_phone
// - customer_type
// - address
// - is_deleted
// Uses Next.js proxy routes:
// - GET  /api/customers/uuid/:cuuid
// - PATCH /api/customers/:uuid

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useLoadScript, type Libraries } from "@react-google-maps/api";

type Customer = {
  uuid: string;
  first_name: string;
  last_name?: string | null;
  mobile_phone?: string | null;
  landline_phone?: string | null;
  email?: string | null;
  address?: string | null;
  customer_type?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  is_deleted?: boolean;
  created_by_uuid?: string | null;
  created_via?: string | null;
};
type ImageInput = {
  label: string;
  url: string;
};

type FormDataType = {
  firstName: string;
  lastName: string;
  mobile: string;
  landline: string;
  email: string;
  message: string;
  address: string;
  images: ImageInput[];
};


const Spinner: React.FC<{ text?: string }> = ({ text = "Loading..." }) => (
  <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex flex-col justify-center items-center z-50">
    <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
    <span className="text-white text-lg font-medium">{text}</span>
  </div>
);

const LIBRARIES: Libraries = ["places"];

export default function CustomerPage() {
  const apiKey = process.env.NEXT_PUBLIC_PLACES_API;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_PLACES_API is not set");
  }
  const { loading: authLoading } = useAuth(); // get loading state from 
  const router = useRouter();
  const { uuid, role } = router.query as {
    uuid?: string;
    role?: string;
  };
  const { user } = useAuth();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidRole = user && ["owner", "admin", "employee"].includes(user?.role);
  const roleFromUrl = typeof role === "string" ? role : user?.role;

    const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const [formData, setFormData] = useState<FormDataType>({
      firstName: "",
      lastName: "",
      mobile: "",
      landline: "",
      email: "",
      message: "",
      address: "",
      images: [
        { label: "", url: "" },
        { label: "", url: "" },
        { label: "", url: "" },
        { label: "", url: "" },
      ],
    });

  const autocompleteContainerRef = useRef<HTMLDivElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);

  // Fetch customer
 useEffect(() => {
  if (!router.isReady) return;

  if (!uuid) {
    setLoading(false);
    setError("Customer UUID is missing");
    return;
  }

  if (!user) {
    return;
  }

  if (!isValidRole) {
    setLoading(false);
    setError("You are not allowed to view this customer");
    return;
  }

  const fetchCustomer = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/customers/uuid/${uuid}`);
      const contentType = res.headers.get("content-type") || "";

      let data: any;
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("API returned non-JSON:", text.slice(0, 500));
        throw new Error("Failed to fetch customer: backend returned non-JSON");
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch customer");
      }

      setCustomer(data.customer || data);
    } catch (err: any) {
      console.error("Error fetching customer:", err.message || err);
      setError(err.message || "Failed to fetch customer");
    } finally {
      setLoading(false);
    }
  };

  fetchCustomer();
}, [router.isReady, uuid, user, isValidRole]);


  useEffect(() => {
    if (!isLoaded || !autocompleteContainerRef.current || authLoading) return; // wait for auth

    const initAutocomplete = async () => {
      // await google.maps.importLibrary("places");

      // Clear old element if it exists
      autocompleteContainerRef.current!.innerHTML = "";
       // Bounds for all of New Zealand
      // const nzBounds = new google.maps.LatLngBounds(
      //   new google.maps.LatLng(-47.3, 166.2), // southwest corner of NZ
      //   new google.maps.LatLng(-34.4, 178.6)  // northeast corner of NZ
      // );
      const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: ["nz"] },
        requestedRegion: 'nz', // restrict to New Zealand
        locationBias: {
        center: { lat: -41.21, lng: 174.91 }, // Wellington region center
        radius: 40000, // 40km covers Wellington + Lower Hutt + Upper Hutt
      },
         
      });

      autocompleteContainerRef.current!.appendChild(placeAutocomplete);

      placeAutocomplete.addEventListener(
        "gmp-select",
        async ({ placePrediction }: any) => {
          const place = placePrediction.toPlace();
          await place.fetchFields({
            fields: ["formattedAddress", "addressComponents"],
          });

          const address =
            place.formattedAddress || place.displayName || placePrediction.description || "";

          const postcodeComponent = place.addressComponents?.find((c: any) =>
            c.types?.includes("postal_code")
          );

          const postcode = postcodeComponent?.longName || "";

          const fullAddress = postcode ? `${address} ${postcode}` : address;

          setFormData(prev => ({ ...prev, address: fullAddress }));
        }
      );

      autocompleteRef.current = placeAutocomplete;
    };

    initAutocomplete();
  }, [isLoaded, authLoading]);

  // Update customer
  const handleUpdateCustomer = async () => {
    if (!uuid || !customer) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${uuid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update customer");

      setCustomer(data.customer || data);
      alert("Customer updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to update customer");
    } finally {
      setSaving(false);
    }
  };
  console.log({customer}, " dashboard/[role]/customers/[uuid].tsx");
  console.log(router.query);
  if (loadError) return <div>Map failed to load</div>;
  if (loading) return <Spinner text="Loading customer..." />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!customer) return <p>No customer found.</p>;

  return (
    <div
      className="flex flex-col items-center min-h-screen p-6 relative"
      style={{
        backgroundImage: `url('/images/emoji_filling_quote.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-green-100/40 backdrop-blur-sm z-0"></div>
      {saving && <Spinner text="Saving..." />}

      <div className="relative z-10 w-full max-w-[42rem] bg-white/90 shadow-2xl rounded-3xl p-4 backdrop-blur-sm sm:p-8">
        {/* Header */}
        <div className="bg-green-900 rounded-t-lg shadow-md p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <h1 className="flex items-center font-bold m-0 p-0 text-white text-xl sm:text-2xl md:text-3xl">
            <span className="text-2xl sm:text-3xl md:text-3xl translate-x-1">H</span>
            <img
              src="/images/happy-house-1.png"
              alt="Happy Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ml-1"
            />
            <span className="text-xl sm:text-2xl md:text-3xl">ppy Lawns</span>
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div>
              <p className="text-white text-sm">Date</p>
              <p className="text-white text-sm">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-white text-sm">Customer ID</p>
              <p className="text-white text-sm">{customer.uuid}</p>
            </div>
          </div>
        </div>

        {/* Customer fields */}
        <section className="mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-xl font-semibold mb-2 text-gray-700">Customer Info</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <label className="flex flex-col w-full">
              First Name
              <input
                className="border rounded px-3 py-2 w-full shadow-sm focus:ring-1 focus:ring-green-500"
                value={customer.first_name || ""}
                onChange={(e) => setCustomer({ ...customer, first_name: e.target.value })}
              />
            </label>

            <label className="flex flex-col w-full">
              Last Name
              <input
                className="border rounded px-3 py-2 w-full shadow-sm focus:ring-1 focus:ring-green-500"
                value={customer.last_name || ""}
                onChange={(e) => setCustomer({ ...customer, last_name: e.target.value })}
              />
            </label>

            <label className="flex flex-col w-full">
              Email
              <input
                type="email"
                className="border rounded px-3 py-2 w-full shadow-sm focus:ring-1 focus:ring-green-500"
                value={customer.email || ""}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              />
            </label>

            <label className="flex flex-col w-full">
              Mobile
              <input
                className="border rounded px-3 py-2 w-full shadow-sm focus:ring-1 focus:ring-green-500"
                value={customer.mobile_phone || ""}
                onChange={(e) => setCustomer({ ...customer, mobile_phone: e.target.value })}
              />
            </label>

            <label className="flex flex-col w-full">
              Landline
              <input
                className="border rounded px-3 py-2 w-full shadow-sm focus:ring-1 focus:ring-green-500"
                value={customer.landline_phone || ""}
                onChange={(e) =>
                  setCustomer({ ...customer, landline_phone: e.target.value })
                }
              />
            </label>

            <label className="flex flex-col w-full">
              Customer Type
              <select
                className="border rounded px-3 py-2 w-full shadow-sm focus:ring-1 focus:ring-green-500"
                value={customer.customer_type || "individual"}
                onChange={(e) =>
                  setCustomer({ ...customer, customer_type: e.target.value })
                }
              >
                <option value="individual">Individual</option>
                <option value="company">Company</option>
              </select>
            </label>

            <label className="flex flex-col w-full sm:col-span-2">
              Address
              <input
                className="border rounded px-3 py-2 w-full shadow-sm focus:ring-1 focus:ring-green-500"
                value={customer.address || ""}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              />
            </label>
          </div>
        </section>

        <section className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/${roleFromUrl || "owner"}`)}
          >
            Back
          </Button>

          <Button onClick={handleUpdateCustomer}>Update Customer</Button>
        </section>
      </div>
    </div>
  );
}