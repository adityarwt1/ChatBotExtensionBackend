"use client";
import React, { useState } from "react";

const Page = () => {
  const [responseData, setResponseData] = useState<string>("");

  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ✅ Create FormData
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/image/describe", {
        method: "POST",
        body: formData, // ✅ send raw FormData
      });

      const data = await response.json();
      if (response.ok) {
        setResponseData(data.text);
      } else {
        setResponseData(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      setResponseData("Something went wrong.");
    }
  };

  return (
    <div className="p-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleImage}
        className="mb-4"
      />
      {responseData && (
        <div className="p-2 border rounded bg-gray-100 text-black">{responseData}</div>
      )}
    </div>
  );
};

export default Page;
