"use client";

import { useActionState, useEffect, useRef, useState, startTransition, type FocusEvent, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ImagePlus, Send, X } from "lucide-react";
import { submitQuote } from "@/app/actions/quote";
import { budgetOptions, contactMethodOptions, projectTypeOptions } from "@/config/services";
import { initialFormState, MAX_PHOTOS, MAX_PHOTO_BYTES } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { buttonClasses } from "../ui/button";
import { Field, SpamProtection, StatusMessage, SubmitButton, SuccessPanel } from "./form-kit";

type SelectedPhoto = { id: string; file: File; preview: string | null };

const MAX_TOTAL_UPLOAD = 11 * 1024 * 1024;

/**
 * Resizes large photos in the browser before upload (phones produce 5–15 MB
 * images). Falls back to the original file if the browser can't decode it.
 */
async function compressImage(file: File, maxSide = 2000, quality = 0.82): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.size < 600 * 1024) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

/** Prevents choosing a start date in the past (uses the visitor's local date). */
function setMinToday(e: FocusEvent<HTMLInputElement>) {
  const d = new Date();
  e.currentTarget.min = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function QuoteForm() {
  const [state, dispatch, pending] = useActionState(submitQuote, initialFormState);
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const presetType = searchParams.get("type");
  const defaultType = presetType && projectTypeOptions.includes(presetType) ? presetType : "";

  // Release object URLs when photos are removed / component unmounts.
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => () => photosRef.current.forEach((p) => p.preview && URL.revokeObjectURL(p.preview)), []);

  function addFiles(list: FileList | null) {
    if (!list) return;
    setPhotoError(null);
    const incoming = Array.from(list);
    const next = [...photos];
    for (const file of incoming) {
      if (next.length >= MAX_PHOTOS) {
        setPhotoError(`You can upload up to ${MAX_PHOTOS} photos.`);
        break;
      }
      const isImage = file.type.startsWith("image/") || /\.(heic|heif)$/i.test(file.name);
      if (!isImage) {
        setPhotoError(`"${file.name}" isn't an image file.`);
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setPhotoError(`"${file.name}" is larger than 10 MB.`);
        continue;
      }
      const canPreview = /^image\/(jpeg|png|webp|gif)$/.test(file.type);
      next.push({ id: crypto.randomUUID(), file, preview: canPreview ? URL.createObjectURL(file) : null });
    }
    setPhotos(next);
    if (fileInput.current) fileInput.current.value = "";
  }

  function removePhoto(id: string) {
    setPhotos((list) => {
      const target = list.find((p) => p.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return list.filter((p) => p.id !== id);
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.delete("photos");
    setPreparing(true);
    const prepared = await Promise.all(photos.map((p) => compressImage(p.file)));
    setPreparing(false);
    const total = prepared.reduce((sum, f) => sum + f.size, 0);
    if (total > MAX_TOTAL_UPLOAD) {
      setPhotoError("Your photos are too large to send together. Please remove a few and try again.");
      return;
    }
    prepared.forEach((f) => formData.append("photos", f, f.name));
    startTransition(() => dispatch(formData));
  }

  if (state.status === "success") {
    return (
      <SuccessPanel
        title="Request received"
        message={state.message}
        action={
          <Link href="/" className={buttonClasses("outline", "md")}>
            Back to home
          </Link>
        }
      />
    );
  }

  const v = state.values ?? {};
  const err = state.fieldErrors ?? {};
  const busy = pending || preparing;

  return (
    <form onSubmit={onSubmit} noValidate={false} className="relative space-y-8" aria-describedby="quote-required-note">
      <p id="quote-required-note" className="text-sm text-muted">
        Fields marked <span className="text-lime">*</span> are required.
      </p>

      <fieldset className="grid gap-6 sm:grid-cols-2">
        <legend className="mb-6 font-display text-lg font-bold uppercase tracking-[0.14em] text-white">Your details</legend>
        <Field label="Full name" name="fullName" required error={err.fullName}>
          {(p) => <input {...p} type="text" autoComplete="name" maxLength={120} defaultValue={v.fullName} className="field" />}
        </Field>
        <Field label="Email address" name="email" required error={err.email}>
          {(p) => <input {...p} type="email" autoComplete="email" maxLength={254} defaultValue={v.email} className="field" />}
        </Field>
        <Field label="Phone number" name="phone" error={err.phone}>
          {(p) => <input {...p} type="tel" autoComplete="tel" maxLength={40} defaultValue={v.phone} className="field" />}
        </Field>
        <Field label="Preferred contact method" name="contactMethod" error={err.contactMethod}>
          {(p) => (
            <select {...p} defaultValue={v.contactMethod ?? ""} className="field">
              <option value="">Select…</option>
              {contactMethodOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          )}
        </Field>
      </fieldset>

      <fieldset className="grid gap-6 sm:grid-cols-2">
        <legend className="mb-6 font-display text-lg font-bold uppercase tracking-[0.14em] text-white">Project details</legend>
        <Field label="Project address or city" name="location" error={err.location} className="sm:col-span-2">
          {(p) => <input {...p} type="text" autoComplete="street-address" maxLength={200} defaultValue={v.location} className="field" />}
        </Field>
        <Field label="Type of project" name="projectType" error={err.projectType}>
          {(p) => (
            <select {...p} defaultValue={v.projectType ?? defaultType} className="field">
              <option value="">Select a service…</option>
              {projectTypeOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Project budget" name="budget" error={err.budget}>
          {(p) => (
            <select {...p} defaultValue={v.budget ?? ""} className="field">
              <option value="">Select a range…</option>
              {budgetOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="Desired start date" name="startDate" error={err.startDate}>
          {(p) => <input {...p} type="date" onFocus={setMinToday} defaultValue={v.startDate} className="field" />}
        </Field>
        <div className="hidden sm:block" aria-hidden />
        <Field
          label="Project description"
          name="description"
          required
          error={err.description}
          hint="Scope, measurements, materials, timeline — the more detail, the more accurate your estimate."
          className="sm:col-span-2"
        >
          {(p) => <textarea {...p} rows={6} minLength={10} maxLength={5000} defaultValue={v.description} className="field resize-y" />}
        </Field>
      </fieldset>

      <fieldset>
        <legend className="field-label">
          Upload project photos <span className="ml-2 normal-case tracking-normal text-white/40">(optional, up to {MAX_PHOTOS})</span>
        </legend>
        <label
          htmlFor="quote-photos"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "mt-2 flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-white/15 bg-[#0e0e0e] px-6 py-10 text-center transition-colors hover:border-lime/60 focus-within:border-lime",
            (photoError || err.photos) && "border-red-500/60",
          )}
        >
          <ImagePlus className="size-9 text-lime" aria-hidden />
          <span className="font-semibold text-white">Click to choose photos or drag them here</span>
          <span className="text-xs text-white/50">JPG, PNG, WEBP or HEIC · up to 10 MB each</span>
          <input
            ref={fileInput}
            id="quote-photos"
            name="photos"
            type="file"
            accept="image/*,.heic,.heif"
            multiple
            className="sr-only"
            onChange={(e) => addFiles(e.target.files)}
          />
        </label>
        {(photoError || err.photos) && (
          <p className="mt-2 text-sm text-red-400" role="alert">
            {photoError ?? err.photos}
          </p>
        )}
        {photos.length > 0 && (
          <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4" aria-label="Selected photos">
            {photos.map((p) => (
              <li key={p.id} className="group relative aspect-square overflow-hidden border border-white/10 bg-charcoal">
                {p.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
                  <img src={p.preview} alt={p.file.name} className="size-full object-cover" />
                ) : (
                  <span className="grid size-full place-items-center p-2 text-center text-xs break-all text-white/60">{p.file.name}</span>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(p.id)}
                  className="absolute right-1.5 top-1.5 grid size-7 place-items-center bg-ink/85 text-white transition-colors hover:bg-red-500"
                  aria-label={`Remove ${p.file.name}`}
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <SpamProtection resetKey={state} />
      <StatusMessage state={state} />

      <div className="flex flex-col items-start gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-xs leading-relaxed text-white/50">
          Your information is only used to respond to your request. We never sell or share your details.
        </p>
        <SubmitButton pending={busy}>
          {preparing ? "Preparing photos…" : pending ? "Sending…" : "Submit Quote Request"}
          {!busy && <Send className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />}
        </SubmitButton>
      </div>
    </form>
  );
}
