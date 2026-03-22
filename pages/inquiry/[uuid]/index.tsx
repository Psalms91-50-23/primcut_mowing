import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function InquiryDetail() {
  const router = useRouter();
  const { uuid } = router.query;

  const [inquiry, setInquiry] = useState<any>(null);

  useEffect(() => {
    if (!uuid) return;

    const fetchInquiry = async () => {
      const res = await fetch(`/api/inquiry/${uuid}`);
      const data = await res.json();
      setInquiry(data);
    };

    fetchInquiry();
  }, [uuid]);

  if (!inquiry) return <div>Loading...</div>;

  return (
    <div>
      <h1>Inquiry {uuid}</h1>
      <p>{inquiry.message}</p>
    </div>
  );
}