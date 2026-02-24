"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { RoomPhotoRow, RoomRow } from "./types";

type RoomFormState = {
  id?: number;
  title: string;
  type: string;
  location: string;
  price: string;
  basic_price: string;
  full_price: string;
  badge: string;
  beds: string;
  baths: string;
  guests: string;
  image: string;
  description: string;
  amenities: string;
};

const emptyRoom: RoomFormState = {
  title: "",
  type: "",
  location: "",
  price: "",
  basic_price: "",
  full_price: "",
  badge: "",
  beds: "",
  baths: "",
  guests: "",
  image: "",
  description: "",
  amenities: "",
};

export function RoomsPanel() {
  const [rooms, setRooms] = useState<RoomRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<RoomFormState>(emptyRoom);
  const [photos, setPhotos] = useState<RoomPhotoRow[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const bucketName = "room-photos";

  const roomIdForPath = useMemo(() => (form.id ? String(form.id) : "tmp"), [form.id]);

  useEffect(() => {
    let isMounted = true;

    async function loadRooms() {
      setLoading(true);
      const { data, error } = await supabase
        .from("rooms")
        .select("id,title,type,location,price,basic_price,full_price,badge,beds,baths,guests,image,description,amenities")
        .order("created_at", { ascending: false });
      if (!error && isMounted) {
        setRooms((data || []) as RoomRow[]);
      }
      setLoading(false);
    }

    void loadRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  const startCreate = () => {
    setForm(emptyRoom);
    setPhotos([]);
    setPhotoError(null);
  };

  const startEdit = (room: RoomRow) => {
    setForm({
      id: room.id,
      title: room.title,
      type: room.type,
      location: room.location,
      price: String(room.price ?? ""),
      basic_price: String(room.basic_price ?? ""),
      full_price: String(room.full_price ?? ""),
      badge: room.badge ?? "",
      beds: String(room.beds ?? ""),
      baths: String(room.baths ?? ""),
      guests: String(room.guests ?? ""),
      image: room.image ?? "",
      description: room.description ?? "",
      amenities: room.amenities ?? "",
    });
    setPhotoError(null);
  };

  useEffect(() => {
    let isMounted = true;

    async function loadPhotos(roomId: number) {
      const { data, error } = await supabase
        .from("room_photos")
        .select("id,room_id,url,storage_path,created_at")
        .eq("room_id", roomId)
        .order("created_at", { ascending: false });

      if (!error && isMounted) {
        setPhotos((data || []) as RoomPhotoRow[]);
      }
      if (error && isMounted) {
        // Table/policies might not exist yet
        console.warn("Unable to load room_photos:", error.message);
      }
    }

    if (form.id) {
      void loadPhotos(form.id);
    } else {
      setPhotos([]);
    }

    return () => {
      isMounted = false;
    };
  }, [form.id]);

  const safeName = (name: string) => name.replace(/[^\w.\-]+/g, "-");

  const uploadImage = async (file: File, folder: "cover" | "gallery") => {
    setPhotoError(null);

    const ext = file.name.split(".").pop() || "jpg";
    const path = `rooms/${roomIdForPath}/${folder}/${Date.now()}-${safeName(file.name)}.${ext}`;

    const { error: uploadError } = await supabase.storage.from(bucketName).upload(path, file, {
      upsert: false,
      contentType: file.type || "image/*",
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
    if (!data.publicUrl) {
      throw new Error("Could not generate public URL (is the bucket public?)");
    }

    return { publicUrl: data.publicUrl, storagePath: path };
  };

  const onCoverSelected = async (file: File | null) => {
    if (!file) return;

    setUploadingCover(true);
    try {
      const { publicUrl } = await uploadImage(file, "cover");
      setForm((prev) => ({ ...prev, image: publicUrl }));

      // If room already exists, persist cover immediately
      if (form.id) {
        const { error } = await supabase.from("rooms").update({ image: publicUrl }).eq("id", form.id);
        if (error) {
          throw new Error(error.message);
        }

        const refreshed = await supabase
          .from("rooms")
          .select("id,title,type,location,price,basic_price,full_price,badge,beds,baths,guests,image,description,amenities")
          .order("created_at", { ascending: false });
        if (!refreshed.error) {
          setRooms((refreshed.data || []) as RoomRow[]);
        }
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Cover upload failed";
      setPhotoError(message);
      alert(`Cover upload failed: ${message}`);
    } finally {
      setUploadingCover(false);
    }
  };

  const onGallerySelected = async (files: FileList | null) => {
    if (!form.id) {
      alert("Save the room first, then add gallery photos.");
      return;
    }
    if (!files || files.length === 0) return;

    setUploadingGallery(true);
    setPhotoError(null);

    try {
      const uploads = await Promise.all(
        Array.from(files).map(async (file) => {
          const { publicUrl, storagePath } = await uploadImage(file, "gallery");
          return { url: publicUrl, storage_path: storagePath, room_id: form.id as number };
        })
      );

      const { error } = await supabase.from("room_photos").insert(uploads);
      if (error) throw new Error(error.message);

      const refreshed = await supabase
        .from("room_photos")
        .select("id,room_id,url,storage_path,created_at")
        .eq("room_id", form.id)
        .order("created_at", { ascending: false });
      if (!refreshed.error) {
        setPhotos((refreshed.data || []) as RoomPhotoRow[]);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Gallery upload failed";
      setPhotoError(message);
      alert(`Gallery upload failed: ${message}`);
    } finally {
      setUploadingGallery(false);
    }
  };

  const deleteGalleryPhoto = async (photo: RoomPhotoRow) => {
    if (!confirm("Remove this photo from the room gallery?")) return;

    const previous = photos;
    setPhotos((cur) => cur.filter((p) => p.id !== photo.id));

    const { error: storageErr } = await supabase.storage.from(bucketName).remove([photo.storage_path]);
    if (storageErr) {
      console.warn("Could not delete storage object:", storageErr.message);
    }

    const { error: dbErr } = await supabase.from("room_photos").delete().eq("id", photo.id);
    if (dbErr) {
      alert(`Could not delete photo: ${dbErr.message}`);
      setPhotos(previous);
    }
  };

  const handleChange = (field: keyof RoomFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: form.title,
      type: form.type,
      location: form.location,
      price: Number(form.price || 0),
      basic_price: Number(form.basic_price || 0),
      full_price: Number(form.full_price || 0),
      badge: form.badge || null,
      beds: Number(form.beds || 0),
      baths: Number(form.baths || 0),
      guests: Number(form.guests || 0),
      image: form.image,
      description: form.description || null,
      amenities: form.amenities || null,
    };

    const isEditing = Boolean(form.id);
    const query = isEditing
      ? supabase.from("rooms").update(payload).eq("id", form.id as number)
      : supabase.from("rooms").insert(payload);

    const { error } = await query;
    if (error) {
      alert(`Could not save homestay: ${error.message}`);
      setSaving(false);
      return;
    }

    const refreshed = await supabase
      .from("rooms")
      .select("id,title,type,location,price,basic_price,full_price,badge,beds,baths,guests,image,description,amenities")
      .order("created_at", { ascending: false });

    if (!refreshed.error) {
      setRooms((refreshed.data || []) as RoomRow[]);
      setForm(emptyRoom);
    }

    setSaving(false);
  };

  const handleDelete = async (room: RoomRow) => {
    if (!confirm(`Delete "${room.title}"? This will remove it from the website.`)) return;

    const previous = rooms;
    setRooms((current) => current.filter((r) => r.id !== room.id));

    const { error } = await supabase.from("rooms").delete().eq("id", room.id);
    if (error) {
      alert(`Could not delete homestay: ${error.message}`);
      setRooms(previous);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-strong)]">Homestays</h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Add new homestays, update pricing, or refresh the cover photos used on your public website.
            </p>
          </div>
          <button
            type="button"
            onClick={startCreate}
            className="rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-strong)] hover:bg-[color-mix(in_srgb,var(--surface)_80%,white_20%)]"
          >
            New homestay
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-xs text-[var(--text-muted)]">Loading homestays…</p>
          ) : rooms.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)]">
              No homestays found yet. Use &quot;New homestay&quot; to add your first listing.
            </p>
          ) : (
            <table className="min-w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)]">
                  <th className="px-2 py-2 font-medium">Homestay</th>
                  <th className="px-2 py-2 font-medium">Type</th>
                  <th className="px-2 py-2 font-medium">Location</th>
                  <th className="px-2 py-2 font-medium">Price (RM)</th>
                  <th className="px-2 py-2 font-medium">Sleeps</th>
                  <th className="px-2 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr
                    key={room.id}
                    className="border-b border-[color-mix(in_srgb,var(--border-subtle)_80%,transparent_20%)]"
                  >
                    <td className="px-2 py-1.5">
                      <div className="font-medium text-[var(--text-strong)]">{room.title}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">
                        {room.badge ? `${room.badge} • ` : ""}
                        {room.image ? "Cover photo set" : "No photo yet"}
                      </div>
                    </td>
                    <td className="px-2 py-1.5">{room.type}</td>
                    <td className="px-2 py-1.5">{room.location}</td>
                    <td className="px-2 py-1.5">{room.price}</td>
                    <td className="px-2 py-1.5">
                      {room.guests} guests · {room.beds} beds · {room.baths} baths
                    </td>
                    <td className="px-2 py-1.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => startEdit(room)}
                        className="text-[10px] text-[var(--primary)] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(room)}
                        className="text-[10px] text-[var(--danger,#ef4444)] hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-[var(--text-strong)]">
          {form.id ? "Edit homestay details" : "Create a new homestay"}
        </h2>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Changes saved here update the cards, pricing and photos on your public homestays section.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Title</span>
            <input
              className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3 text-sm font-medium focus:border-[var(--primary)] outline-none transition-all"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Type</span>
            <input
              className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3 text-sm font-medium focus:border-[var(--primary)] outline-none transition-all"
              value={form.type}
              onChange={(e) => handleChange("type", e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Location</span>
            <input
              className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3 text-sm font-medium focus:border-[var(--primary)] outline-none transition-all"
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Price per night (RM)</span>
            <input
              type="number"
              min="0"
              className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3 text-sm font-medium focus:border-[var(--primary)] outline-none transition-all"
              value={form.price}
              onChange={(e) => handleChange("price", e.target.value)}
              required
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Basic Package Price (RM)</span>
            <input
              type="number"
              min="0"
              className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3 text-sm font-medium focus:border-[var(--primary)] outline-none transition-all"
              value={form.basic_price}
              onChange={(e) => handleChange("basic_price", e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Full Package Price (RM)</span>
            <input
              type="number"
              min="0"
              className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3 text-sm font-medium focus:border-[var(--primary)] outline-none transition-all"
              value={form.full_price}
              onChange={(e) => handleChange("full_price", e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Badge (optional)</span>
            <input
              className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3 text-sm font-medium focus:border-[var(--primary)] outline-none transition-all"
              value={form.badge}
              onChange={(e) => handleChange("badge", e.target.value)}
              placeholder="Popular, Best Value, Exclusive…"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Beds</span>
            <input
              type="number"
              min="0"
              className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3 text-sm font-medium focus:border-[var(--primary)] outline-none transition-all"
              value={form.beds}
              onChange={(e) => handleChange("beds", e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Baths</span>
            <input
              type="number"
              min="0"
              className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3 text-sm font-medium focus:border-[var(--primary)] outline-none transition-all"
              value={form.baths}
              onChange={(e) => handleChange("baths", e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Guests</span>
            <input
              type="number"
              min="1"
              className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3 text-sm font-medium focus:border-[var(--primary)] outline-none transition-all"
              value={form.guests}
              onChange={(e) => handleChange("guests", e.target.value)}
            />
          </label>

          <label className="md:col-span-3 flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Description</span>
            <textarea
              rows={3}
              className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3 text-sm font-medium focus:border-[var(--primary)] outline-none transition-all"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Serene accommodation with premium amenities, spacious living area..."
            />
          </label>

          <label className="md:col-span-3 flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Amenities (comma-separated)</span>
            <input
              className="rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3 text-sm font-medium focus:border-[var(--primary)] outline-none transition-all"
              value={form.amenities}
              onChange={(e) => handleChange("amenities", e.target.value)}
              placeholder="WiFi, Air Conditioning, Kitchen, Parking, BBQ Pit, Swimming Pool..."
            />
          </label>

          <label className="md:col-span-3 flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Cover photo</span>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <input
                type="file"
                accept="image/*"
                className="block w-full text-xs"
                onChange={(e) => void onCoverSelected(e.target.files?.[0] || null)}
              />
              <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap">
                {uploadingCover ? "Uploading…" : "Upload from device"}
              </span>
            </div>
            <input
              className="mt-2 rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3 text-sm font-medium focus:border-[var(--primary)] outline-none transition-all"
              value={form.image}
              onChange={(e) => handleChange("image", e.target.value)}
              placeholder="Paste an image URL or upload via Supabase Storage"
            />
          </label>

          <div className="md:col-span-3 rounded-lg border border-dashed border-[var(--border-subtle)] bg-[var(--surface)] p-3">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold text-[var(--text-strong)]">Gallery photos</p>
                <p className="mt-0.5 text-[10px] text-[var(--text-muted)]">
                  Upload additional photos so customers can see the full homestay. Save the homestay first to enable uploads.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={!form.id || uploadingGallery}
                  className="block text-xs"
                  onChange={(e) => void onGallerySelected(e.target.files)}
                />
                <span className="text-[10px] text-[var(--text-muted)]">
                  {uploadingGallery ? "Uploading…" : form.id ? "Upload" : "Save homestay to enable"}
                </span>
              </div>
            </div>

            {photoError && <p className="mt-2 text-[10px] text-amber-500">{photoError}</p>}

            {photos.length > 0 ? (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                {photos.map((p) => (
                  <div key={p.id} className="group relative overflow-hidden rounded-md border border-[var(--border-subtle)]">
                    <img src={p.url} alt="Homestay gallery" className="h-16 w-full object-cover" loading="lazy" />
                    <button
                      type="button"
                      onClick={() => void deleteGalleryPhoto(p)}
                      className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] text-white opacity-0 transition group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[10px] text-[var(--text-muted)]">No gallery photos yet.</p>
            )}
          </div>

          <div className="md:col-span-3 flex items-center justify-between gap-3 pt-4 border-t border-[var(--border-subtle)]">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-2xl bg-[var(--primary)] px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl hover:opacity-90 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={() => setForm(emptyRoom)}
                className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-strong)] hover:underline transition-all"
              >
                Cancel editing
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}

