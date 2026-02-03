import { useState } from "react";
import  supabase  from "../config/db.js";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);

  const uploadImage = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    // 1) Upload file
    const { error } = await supabase.storage
      .from("quote-images")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Upload failed:", error);
      return;
    }

    // 2) Get public URL
    const { data } = supabase.storage
      .from("quote-images")
      .getPublicUrl(fileName);
    console.log({data})
    console.log("PUBLIC URL:", data.publicUrl);
    alert("Upload success! Check console for URL");
  };

  return (
    <div className="pt-40">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button onClick={uploadImage}>Upload Test Image</button>
    </div>
  );
}
