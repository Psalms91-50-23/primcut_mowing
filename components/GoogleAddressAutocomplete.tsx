import React, { useEffect, useRef } from "react";
import { useLoadScript, type Libraries } from "@react-google-maps/api";

const LIBRARIES: Libraries = ["places"];

type Props = {
  value: string;
  onSelect: (address: string) => void;
  label?: string;
  placeholder?: string;
  country?: string;
  regionBias?: {
    lat: number;
    lng: number;
    radius: number;
  };
  disabled?: boolean;
  helperText?: string;
};

export default function GoogleAddressAutocomplete({
  value,
  onSelect,
  label = "Address",
  placeholder = "Enter address",
  country = "nz",
  regionBias = {
    lat: -41.21,
    lng: 174.91,
    radius: 40000,
  },
  disabled = false,
  helperText,
}: Props) {
  const apiKey = process.env.NEXT_PUBLIC_PLACES_API;

  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_PLACES_API is not set");
  }

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: LIBRARIES,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const autocompleteRef =
    useRef<google.maps.places.PlaceAutocompleteElement | null>(null);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || disabled) return;
    if (autocompleteRef.current) return; // create only once

    const placeAutocomplete = new google.maps.places.PlaceAutocompleteElement({
      componentRestrictions: { country: [country] },
      requestedRegion: country,
      locationBias: {
        center: { lat: regionBias.lat, lng: regionBias.lng },
        radius: regionBias.radius,
      },
    });

    const container = containerRef.current;
    container.innerHTML = "";
    container.appendChild(placeAutocomplete);
    autocompleteRef.current = placeAutocomplete;

    const syncInput = () => {
      const input = placeAutocomplete.shadowRoot?.querySelector("input");
      if (input) {
        (input as HTMLInputElement).value = value || "";
        (input as HTMLInputElement).placeholder = placeholder;
      }
    };

    syncInput();

    const handleSelect = async (event: any) => {
      const placePrediction = event.placePrediction;
      if (!placePrediction) return;

      const place = placePrediction.toPlace();

      await place.fetchFields({
        fields: ["formattedAddress", "addressComponents", "displayName"],
      });

      const address =
        place.formattedAddress ||
        place.displayName ||
        placePrediction?.description ||
        "";

      const postcodeComponent = place.addressComponents?.find((c: any) =>
        c.types?.includes("postal_code")
      );

      const postcode = postcodeComponent?.longName || "";
      const fullAddress = postcode ? `${address} ${postcode}` : address;

      onSelectRef.current(fullAddress);
    };

    placeAutocomplete.addEventListener("gmp-select", handleSelect);

    return () => {
      placeAutocomplete.removeEventListener("gmp-select", handleSelect);
      autocompleteRef.current = null;
      container.innerHTML = "";
    };
  }, [isLoaded, disabled, country, regionBias.lat, regionBias.lng, regionBias.radius]);

  useEffect(() => {
    const input = autocompleteRef.current?.shadowRoot?.querySelector("input");
    if (input) {
      (input as HTMLInputElement).value = value || "";
      (input as HTMLInputElement).placeholder = placeholder;
    }
  }, [value, placeholder]);

  if (loadError) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-slate-600">{label}</label>
        <input
          type="text"
          value={value}
          onChange={() => {}}
          placeholder={placeholder}
          disabled
          className="w-full rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-slate-500 outline-none"
        />
        <p className="text-xs text-red-600">
          Google address suggestions failed to load.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm text-slate-600">{label}</label>

      {!isLoaded ? (
        <div className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-500">
          Loading address suggestions...
        </div>
      ) : (
        <div
          ref={containerRef}
          className="gmp-place-autocomplete rounded-lg border border-slate-300 bg-white"
        />
      )}

      {value ? (
        <p className="text-xs text-slate-500 break-words">
          Selected address: {value}
        </p>
      ) : null}

      {helperText ? (
        <p className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
}