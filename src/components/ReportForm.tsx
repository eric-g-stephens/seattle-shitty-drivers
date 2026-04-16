"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BehaviorPicker } from "@/components/BehaviorPicker";
import { GpsCapture } from "@/components/GpsCapture";

const schema = z.object({
  state:    z.string().min(1),
  plate:    z.string().min(1, "Plate required"),
  make:     z.string().max(50).optional(),
  model:    z.string().max(50).optional(),
  color:    z.string().max(30).optional(),
  notes:    z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

export function ReportForm() {
  const router = useRouter();
  const [behaviors, setBehaviors] = useState<string[]>([]);
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { state: "WA" },
  });

  const onSubmit = async (values: FormValues) => {
    if (behaviors.length === 0) {
      setSubmitError("Select at least one bad behavior");
      return;
    }
    if (lat === undefined || lng === undefined) {
      setSubmitError("Location is required — use the button above to capture it");
      return;
    }
    setSubmitError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, behaviors, lat, lng }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubmitError(typeof json.error === "string" ? json.error : "Submission failed");
        return;
      }
      router.push(`/plate/WA/${values.plate.toUpperCase().replace(/[\s\-]/g, "")}?reported=1`);
    } catch {
      setSubmitError("Network error — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label>State</Label>
          <Input {...register("state")} defaultValue="WA" placeholder="WA" />
        </div>
        <div className="col-span-2 space-y-1">
          <Label>License plate *</Label>
          <Input {...register("plate")} placeholder="ABC1234" className="uppercase" />
          {errors.plate && <p className="text-sm text-destructive">{errors.plate.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label>Make</Label>
          <Input {...register("make")} placeholder="Toyota" />
        </div>
        <div className="space-y-1">
          <Label>Model</Label>
          <Input {...register("model")} placeholder="Camry" />
        </div>
        <div className="space-y-1">
          <Label>Color</Label>
          <Input {...register("color")} placeholder="Silver" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>What did they do? * (select all that apply)</Label>
        <BehaviorPicker selected={behaviors} onChange={setBehaviors} />
        {behaviors.length === 0 && submitError && (
          <p className="text-sm text-destructive">Select at least one behavior</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Location *</Label>
        <GpsCapture
          onCapture={(la, lo) => { setLat(la); setLng(lo); }}
          lat={lat}
          lng={lng}
        />
      </div>

      <div className="space-y-1">
        <Label>Notes <span className="text-muted-foreground text-xs">(optional, max 500 chars)</span></Label>
        <Textarea {...register("notes")} placeholder="What happened?" rows={3} />
        {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
      </div>

      {submitError && <p className="text-sm text-destructive">{submitError}</p>}

      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit report"}
      </Button>
    </form>
  );
}
