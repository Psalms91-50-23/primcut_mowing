import React, { useEffect, useRef, useState } from "react";
import { useLoadScript, type Libraries } from "@react-google-maps/api";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext"; 
import supabase from "@/config/db";
import  Header  from "@/components/headers/Header";

type Props = {};

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

const LIBRARIES: Libraries = ["places"];

export default function ContactPage(props: Props) {
const apiKey = process.env.NEXT_PUBLIC_PLACES_API;
const { loading } = useAuth(); // get loading state from 
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_PLACES_API is not set");
  }
  // const memoLibraries = React.useMemo(() => LIBRARIES, [])
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const autocompleteContainerRef = useRef<HTMLDivElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.PlaceAutocompleteElement | null>(null);

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

  const [imageFiles, setImageFiles] = useState<(File | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preferredContactMethod, setPreferredContactMethod] =
    useState<"mobile" | "landline" | "email">("email");

  const [services, setServices] = useState<
    { value: string; label: string; selected: boolean }[]
  >([
    { value: "property_maintenance", label: "Property maintenance", selected: false },
    { value: "mowing", label: "Mowing", selected: false },
    { value: "spraying", label: "Spraying", selected: false },
    { value: "junk_removal", label: "Junk/Furniture removal", selected: false },
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // // ---------- NEW AUTOCOMPLETE ----------
  // useEffect(() => {
  //   if (!isLoaded) return;

  //   const init = async () => {
  //     await google.maps.importLibrary("places");

  //     const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement({});

  //     if (!autocompleteContainerRef.current) return;
  //     autocompleteContainerRef.current.innerHTML = "";
  //     autocompleteContainerRef.current.appendChild(placeAutocomplete);

  //     placeAutocomplete.addEventListener("gmp-select", async ({ placePrediction }: any) => {
  //     const place = placePrediction.toPlace();
  //     await place.fetchFields({
  //       fields: ["displayName", "formattedAddress", "addressComponents"],
  //     });

  //     const address =
  //       place.formattedAddress || place.displayName || placePrediction.description || "";

  //     const postcodeComponent =
  //       place.addressComponents?.find((c: any) =>
  //         c.types?.includes("postal_code")
  //       ) || null;

  //     const postcode = postcodeComponent?.longName || "";

  //     // Append postcode to address if it exists
  //     const fullAddress = postcode ? `${address} ${postcode}` : address;

  //     setFormData(prev => ({ ...prev, address: fullAddress }));
  //     });

  //     autocompleteRef.current = placeAutocomplete;
  //   };

  //   init();
  // }, [isLoaded]);


useEffect(() => {
  if (!isLoaded || !autocompleteContainerRef.current || loading) return; // wait for auth

  const initAutocomplete = async () => {
    await google.maps.importLibrary("places");

    // Clear old element if it exists
    autocompleteContainerRef.current!.innerHTML = "";

    const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement({});

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
}, [isLoaded, loading]);


//   useEffect(() => {
//   if (!isLoaded || !autocompleteContainerRef.current) return;

//   const input = document.createElement("input");
//   input.type = "text";
//   input.placeholder = "Enter your address";
//   input.className = "input-border w-full border px-3 py-2 rounded";

//   autocompleteContainerRef.current.innerHTML = "";
//   autocompleteContainerRef.current.appendChild(input);

//   const autocomplete = new google.maps.places.Autocomplete(input, {
//     fields: ["formatted_address", "address_components", "geometry"],
//   });

//   autocomplete.addListener("place_changed", () => {
//     const place = autocomplete.getPlace();

//     const address = place.formatted_address || "";

//     const postcodeComponent = place.address_components?.find(c =>
//       c.types?.includes("postal_code")
//     );

//     const postcode = postcodeComponent?.long_name || "";

//     const fullAddress = postcode ? `${address} ${postcode}` : address;

//     setFormData(prev => ({ ...prev, address: fullAddress }));
//   });
// }, [isLoaded]);


  const handleServiceChange = (index: number) => {
    setServices(prev => {
      const newServices = [...prev];
      newServices[index].selected = !newServices[index].selected;
      return newServices;
    });
  };

  const handleImageLabelChange = (index: number, value: string) => {
    setFormData(prev => {
      const images = [...prev.images];
      images[index].label = value;
      return { ...prev, images };
    });
  };

  const clearAutocompleteInput = () => {
    const input =
      autocompleteRef.current?.shadowRoot?.querySelector("input");
    if (input) (input as HTMLInputElement).value = "";
  };

  const handleImageFileChange = (index: number, file: File | null) => {
    if (!file) return;

    const maxSizeMB = 10;
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert("File is too large. Max 10MB per image.");
      return;
    }

    setImageFiles(prev => {
      const newFiles = [...prev];
      newFiles[index] = file;
      return newFiles;
    });

    setImagePreviews(prev => {
      const newPreviews = [...prev];
      if (newPreviews[index]) {
        URL.revokeObjectURL(newPreviews[index]!);
      }
      newPreviews[index] = URL.createObjectURL(file);
      return newPreviews;
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
   
    // Validation
    if (!formData.mobile && !formData.landline) {
   
      alert("Please provide at least one contact number.");
      setIsSubmitting(false);
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
   
      alert("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.address) {
     
      alert("Please enter your address.");
      setIsSubmitting(false);
      return;
    }

    const selectedServices = services
      .filter(s => s.selected)
      .map(s => ({
        value: s.value,
        label: s.label,
        unit_price: 0,
        quantity: 1,
      }));
      
      if (selectedServices.length === 0) {
      
      alert("Please select at least one service.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1 Upload images to Supabase
      const uploadedImages = await Promise.all(
        imageFiles.map(async (file, index) => {
          if (!file) return null;
          const fileName = `quotes/${Date.now()}_${file.name}`;

          const { data, error } = await supabase.storage
            .from('quote-images') 
            .upload(fileName, file);

          if (error) throw error;

          const url = supabase.storage
            .from('quote-images')
            .getPublicUrl(fileName).data.publicUrl;

          return {
            label: formData.images[index].label || `Image ${index + 1}`,
            url,
          };
        })
      );

      const imagesPayload = uploadedImages.filter(Boolean);

      // 2Build payload with uploaded image URLs
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        mobile: formData.mobile,
        landline: formData.landline,
        preferred_contact_method: preferredContactMethod,
        email: formData.email,
        message: formData.message,
        address: formData.address,
        services: selectedServices,
        images: imagesPayload,
      };

      //  Send payload to backend
      const res = await fetch(`/api/quotes/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log({res})
      if (res.ok) {
        toast.success("Message sent successfully!");
        // Reset form, previews, and services
        setFormData({
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
        setImageFiles([null, null, null, null]);
        setImagePreviews([null, null, null, null]);
        setServices(prev => prev.map(s => ({ ...s, selected: false })));
        clearAutocompleteInput();
        console.log("before reload")
        setTimeout(() => {
          window.location.reload();
        }, 1500); // optional delay to show toast first
      } else {
        const errorData = await res.json();
        alert(errorData?.error || "Failed to send message. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while sending your quote. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-green-700 border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  if (loadError) return <div>Map failed to load</div>;
  if (!isLoaded) return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-green-700 border-t-transparent border-solid rounded-full animate-spin"></div>
      </div>
    );

  return (
  <div className="relative min-h-screen w-full flex flex-col items-center justify-start text-black pb-5">
    {/* Background Image */}
    <div
      className="absolute inset-0 bg-cover bg-center z-0"
      style={{ backgroundImage: "url('/images/contact_us_1.png')" }}
    />
    {/* Dark overlay */}
    <div className="absolute inset-0 bg-black/50 z-0"></div>

    {/* Main content wrapper */}
    <div className="relative z-10 w-full flex flex-col items-center pt-20 px-4">
      {/* Header text */}
      <div className="text-center space-y-2 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-white">Contact Us</h1>
        <p className="text-xl italic font-bold md:text-base text-gray-200 mb-4">
          Our team strives to reply to all messages within 2 business working days.
        </p>
        <p className="text-lg font-semibold text-gray-100 pb-6 sm:text-base">
          For an accurate quote, please send images.
        </p>
      </div>
      <div className="w-full max-w-lg">
      <Header />
      </div>
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="w-full max-w-lg bg-white/95  rounded-b-sm shadow space-y-4 pb-5 px-6 pt-5"
        >
          {/* NAME */}
          <div className="flex flex-row gap-4">
            <div className="w-1/2">
              <label htmlFor="firstName" className="block font-medium mb-1 py-2">
                First Name
              </label>
              <input
                name="firstName"
                type="text"
                autoComplete="off"
                value={formData.firstName}
                onChange={handleChange}
                className="input-border w-full border px-3 py-2 rounded"
                placeholder="Enter your first Name"
                required
              />
            </div>
            <div className="w-1/2">
              <label htmlFor="lastName" className="block font-medium mb-1 py-2">
                Last Name
              </label>
              <input
                name="lastName"
                type="text"
                autoComplete="off"
                value={formData.lastName}
                onChange={handleChange}
                className="input-border w-full border px-3 py-2 rounded"
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>
          {/* ADDRESS AUTOCOMPLETE */}
          <div className="relative">
            <label htmlFor="address" className="block font-medium mb-1 py-2">
              Address
            </label>
            <div ref={autocompleteContainerRef} className="gmp-place-autocomplete" />
          </div>
          {/* PHONE */}
          <div className="flex flex-col">
            <div className="flex flex-row gap-4">
              <div className="w-1/2">
                <label className="block font-medium mb-1 py-2">Mobile</label>
                <input
                  name="mobile"
                  type="text"
                  autoComplete="off"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="input-border w-full border px-3 py-2 rounded"
                  placeholder="Mobile number"
                />
              </div>
              <div className="w-1/2">
                <label className="block font-medium mb-1 py-2">Landline</label>
                <input
                  name="landline"
                  type="text"
                  autoComplete="off"
                  value={formData.landline}
                  onChange={handleChange}
                  className="input-border w-full border px-3 py-2 rounded"
                  placeholder="Landline number"
                />
              </div>
            </div>
            <span className="text-xs italic py-3">
              Only one contact number is required, but you may add both if you’d like.
            </span>

            <div className="relative flex flex-col pt-1">
              <label className="py-2 mb-1">Preferred contact method</label>
              <select
                value={preferredContactMethod}
                onChange={(e) =>
                  setPreferredContactMethod(e.target.value as "mobile" | "landline" | "email")
                }
                className="input-border w-full border py-3 rounded hover:cursor-pointer px-3"
              >
                <option value="mobile">Mobile</option>
                <option value="landline">Landline</option>
                <option value="email">Email</option>
              </select>
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label htmlFor="email" className="block font-medium mb-1 py-2">
              Email
            </label>
            <input
              name="email"
              type="email"
              id="email"
              autoComplete="off"
              value={formData.email}
              onChange={handleChange}
              className="input-border w-full border px-3 py-2 rounded"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* MESSAGE */}
          <div>
            <label htmlFor="message" className="block font-medium mb-1 py-2">
              Message
            </label>
            <textarea
              name="message"
              id="message"
              autoComplete="off"
              value={formData.message}
              onChange={handleChange}
              className="input-border w-full border px-3 py-2 rounded resize-none overflow-y-scroll overflow-x-hidden"
              placeholder="Write your message"
              rows={5}
              required
            />
          </div>

          {/* SERVICES */}
          <div className="space-y-2">
            <label className="text-lg py-3">Select Services</label>
            <div className="flex flex-wrap gap-2">
              {services.map((service, index) => (
                <label key={service.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={service.selected}
                    onChange={() => handleServiceChange(index)}
                  />
                  {service.label}
                </label>
              ))}
            </div>
          </div>

          {/* IMAGES */}
          <div className="space-y-4">
            <div className="font-semibold">Upload Images</div>
            {formData.images.map((img, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-center gap-4">
                <input
                  type="text"
                  placeholder={`Image ${index + 1} eg front yard`}
                  value={img.label}
                  onChange={(e) => handleImageLabelChange(index, e.target.value)}
                  className="input-border w-full sm:w-1/2 border px-3 py-2 rounded"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageFileChange(index, e.target.files?.[0] || null)
                  }
                  className="input-border w-full sm:w-1/2 border px-3 py-2 rounded hover:cursor-pointer"
                />
                {imagePreviews[index] && (
                  <div className="w-20 h-14 overflow-hidden rounded bg-gray-100">
                    <img
                      src={imagePreviews[index]!}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* SUBMIT BUTTON */}
          <div className="py-5">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded transition
                ${isSubmitting ? "bg-green-600 cursor-not-allowed" : "bg-green-700 hover:bg-green-900 hover:cursor-pointer"}
                text-white`}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </button>
          </div>
        </form>
    </div>
  </div>
  );

}
