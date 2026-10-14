"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function PropertyActions({ propertyId }: { propertyId: string }) {
  const { user, accessToken } = useAuth();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendEnquiry() {
    if (!accessToken) return;
    setLoading(true);
    setStatus(null);
    try {
      await apiFetch(`/properties/${propertyId}/enquiries`, {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({ message }),
      });
      setStatus("Enquiry sent successfully.");
      setMessage("");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Failed to send enquiry");
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavourite() {
    if (!accessToken) return;
    setLoading(true);
    try {
      await apiFetch(`/favourites/${propertyId}`, {
        method: "POST",
        token: accessToken,
      });
      setStatus("Saved to favourites.");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Could not save favourite");
    } finally {
      setLoading(false);
    }
  }

  if (!user) {
    return (
      <div className="mt-6 space-y-3">
        <p className="text-sm text-slate-600">Sign in to enquire or save this listing.</p>
        <Link
          href="/login"
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-brand-700 text-sm font-medium text-white hover:bg-brand-800"
        >
          Log in to enquire
        </Link>
      </div>
    );
  }

  if (user.role !== "TENANT") {
    return (
      <p className="mt-6 text-sm text-slate-600">
        Tenant account required to send enquiries from this page.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="Tell the owner about your move-in timeline..."
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-600 focus:ring-2"
      />
      <Button
        className="w-full"
        disabled={loading}
        onClick={() => void sendEnquiry()}
      >
        Send enquiry
      </Button>
      <Button
        variant="outline"
        className="w-full"
        disabled={loading}
        onClick={() => void toggleFavourite()}
      >
        Save to favourites
      </Button>
      {status && <p className="text-sm text-slate-600">{status}</p>}
    </div>
  );
}
