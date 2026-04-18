"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { isInSeattle } from "@/lib/seattle";

interface GpsCaptureProps {
  onCapture: (lat: number, lng: number) => void;
  lat?: number;
  lng?: number;
}

export function GpsCapture({ onCapture, lat, lng }: GpsCaptureProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const capture = () => {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMsg("Geolocation not supported by your browser");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!isInSeattle(latitude, longitude)) {
          setStatus("error");
          setErrorMsg("This site only accepts reports within the Seattle area");
          return;
        }
        onCapture(latitude, longitude);
        setStatus("ok");
      },
      () => {
        setStatus("error");
        setErrorMsg("Could not get location — make sure location access is allowed");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" onClick={capture} disabled={status === "loading"} className="w-full sm:w-auto">
        {status === "loading" ? "Getting location…" : "Use my current location"}
      </Button>
      {status === "ok" && lat !== undefined && lng !== undefined && (
        <p className="text-sm text-muted-foreground">
          Captured: {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
      )}
      {status === "error" && (
        <p className="text-sm text-destructive">{errorMsg}</p>
      )}
    </div>
  );
}
