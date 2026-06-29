"use client";

import { useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import type { AttendanceStatus } from "@/lib/types";

export function RegistrationForm({ eventSlug, source }: { eventSlug: string; source: "preregistration" | "live" }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [entryNumber, setEntryNumber] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setStatus("loading");
    setMessage("");

    const payload = {
      full_name: String(formData.get("full_name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      city_state: String(formData.get("city_state") ?? ""),
      attendance_status: String(formData.get("attendance_status") ?? "not_sure") as AttendanceStatus,
      registration_source: source,
      consent: formData.get("consent") === "on"
    };

    const response = await fetch(`/api/events/${eventSlug}/register`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      setStatus("error");
      setMessage(data.error ?? "Registration could not be completed.");
      return;
    }

    setEntryNumber(data.entry_number);
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="panel p-6 text-center">
        <CheckCircle2 className="mx-auto text-civic-pine" size={44} />
        <h2 className="mt-4 text-2xl font-bold">Registration confirmed</h2>
        <p className="mt-2 text-civic-ink/70">Your entry number is</p>
        <div className="stat-number mt-3 text-5xl font-black text-civic-pine">{entryNumber}</div>
      </div>
    );
  }

  return (
    <form action={submit} className="panel grid gap-4 p-5">
      <label className="grid gap-2">
        <span className="label">Full name</span>
        <input className="field" name="full_name" required autoComplete="name" />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="label">Email</span>
          <input className="field" name="email" type="email" required autoComplete="email" />
        </label>
        <label className="grid gap-2">
          <span className="label">Phone number</span>
          <input className="field" name="phone" required autoComplete="tel" />
        </label>
      </div>
      <label className="grid gap-2">
        <span className="label">City/state</span>
        <input className="field" name="city_state" required placeholder="Example: Miami, FL" />
      </label>
      <label className="grid gap-2">
        <span className="label">Will you attend the live event?</span>
        <select className="field" name="attendance_status" defaultValue="not_sure">
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="not_sure">Not sure</option>
        </select>
      </label>
      <label className="flex items-start gap-3 rounded-md border border-civic-line bg-civic-mint/40 p-3 text-sm">
        <input className="mt-1" name="consent" type="checkbox" required />
        <span>I confirm this is one entry for one person and the information is accurate.</span>
      </label>
      {message && <p className="rounded-md bg-red-50 p-3 text-sm text-red-800">{message}</p>}
      <button className="btn-primary" disabled={status === "loading"} type="submit">
        <Send size={16} />
        {status === "loading" ? "Submitting..." : "Submit entry"}
      </button>
    </form>
  );
}
