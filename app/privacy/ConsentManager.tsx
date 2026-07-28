"use client";

import { useState } from "react";

export function ConsentManager() {
  const [message, setMessage] = useState("");
  async function withdraw() {
    const ids = JSON.parse(window.localStorage.getItem("airant_consent_ids") || "[]") as string[];
    await Promise.all(ids.map((submissionId) => fetch("/api/consent", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ submissionId }) })));
    window.localStorage.removeItem("airant_consent_ids");
    setMessage(ids.length ? "Permission withdrawn for your unpublished submissions." : "No saved permissions were found on this device.");
  }
  return <div className="consent-manager"><button onClick={withdraw}>Withdraw social-use permission</button>{message && <p>{message}</p>}</div>;
}
