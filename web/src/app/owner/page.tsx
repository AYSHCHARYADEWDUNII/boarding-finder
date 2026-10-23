"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ImagePlus, LogOut, Pencil, Plus, Trash2, X } from "lucide-react";
import { apiBaseUrl, apiRequest, deleteOwnerRoom, fetchOwnerRooms, saveOwnerRoom, uploadOwnerRoomPhoto, type Owner, type RoomInput } from "@/lib/api";
import type { BoardingGender, Room } from "@/lib/rooms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThemeMenu } from "@/components/theme-menu";
import { boardingGenderLabel, formatPrice } from "@/lib/rooms";

type OwnerRoomForm = Omit<RoomInput, "boardingGender"> & {
  boardingGender: Exclude<BoardingGender, "UNSPECIFIED"> | "";
};

function isOwnerBoardingGender(
  value: string,
): value is OwnerRoomForm["boardingGender"] {
  return value === "" || value === "BOYS" || value === "GIRLS" || value === "ANY";
}

const emptyRoom: OwnerRoomForm = {
  title: "",
  description: "",
  monthlyPrice: 0,
  address: "",
  distanceToCampusKm: 0,
  imageUrl: "",
  boardingGender: "",
};

function roomToInput(room: Room): OwnerRoomForm {
  return {
    title: room.title,
    description: room.description,
    monthlyPrice: room.monthlyPrice,
    address: room.address,
    distanceToCampusKm: room.distanceToCampusKm,
    imageUrl: room.imageUrl ?? "",
    boardingGender:
      room.boardingGender === "UNSPECIFIED" ? "" : room.boardingGender,
  };
}

export default function OwnerPage() {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [form, setForm] = useState<OwnerRoomForm>(emptyRoom);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadRooms = useCallback(async () => {
    setRoomsLoading(true);
    setError("");
    try {
      setRooms(await fetchOwnerRooms());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load your listings.",
      );
    } finally {
      setRoomsLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function checkSession() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/auth/me`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });
        if (response.ok) {
          setOwner((await response.json()) as Owner);
        } else if (response.status !== 401) {
          throw new Error("Could not verify your owner account.");
        }
      } catch (sessionError) {
        if (sessionError instanceof Error && sessionError.name === "AbortError") {
          return;
        }
        setError(
          sessionError instanceof Error
            ? sessionError.message
            : "Could not connect to the owner account service.",
        );
      } finally {
        if (!controller.signal.aborted) setCheckingSession(false);
      }
    }
    void checkSession();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (owner) void loadRooms();
  }, [owner, loadRooms]);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const nextOwner = await apiRequest<Owner>(
        mode === "login" ? "/api/auth/login" : "/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            mode === "login" ? { email, password } : { name, email, password },
          ),
        },
      );
      setOwner(nextOwner);
      setPassword("");
    } catch (authError) {
      setError(
        authError instanceof Error ? authError.message : "Sign-in failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function submitRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.boardingGender) {
      setError("Choose who this boarding is for.");
      return;
    }
    if (!form.imageUrl) {
      setError("Upload a photo of the boarding before publishing.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await saveOwnerRoom(
        {
          ...form,
          monthlyPrice: Number(form.monthlyPrice),
          distanceToCampusKm: Number(form.distanceToCampusKm),
          imageUrl: form.imageUrl || null,
          boardingGender: form.boardingGender,
        },
        editingId ?? undefined,
      );
      setForm(emptyRoom);
      setEditingId(null);
      setNotice(editingId ? "Listing updated." : "Listing published.");
      await loadRooms();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Could not save listing.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function removeRoom(room: Room) {
    if (!window.confirm(`Delete "${room.title}"? This cannot be undone.`)) return;
    setError("");
    setNotice("");
    try {
      await deleteOwnerRoom(room.id);
      setRooms((current) => current.filter((item) => item.id !== room.id));
      setNotice("Listing deleted.");
      if (editingId === room.id) cancelEdit();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Could not delete listing.",
      );
    }
  }

  async function signOut() {
    setError("");
    try {
      await apiRequest<void>("/api/auth/logout", { method: "POST" });
      setOwner(null);
      setRooms([]);
      setNotice("You are signed out.");
    } catch (signOutError) {
      setError(
        signOutError instanceof Error ? signOutError.message : "Could not sign out.",
      );
    }
  }

  function startEdit(room: Room) {
    setEditingId(room.id);
    setForm(roomToInput(room));
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyRoom);
  }

  function updateForm<Key extends keyof OwnerRoomForm>(
    key: Key,
    value: OwnerRoomForm[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function uploadPhoto(file: File | undefined) {
    if (!file) return;
    setError("");
    setNotice("");
    setPhotoUploading(true);
    try {
      const imageUrl = await uploadOwnerRoomPhoto(file);
      updateForm("imageUrl", imageUrl);
      setNotice("Photo uploaded. Save the listing to publish it.");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload the photo.",
      );
    } finally {
      setPhotoUploading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              B
            </span>
            Boarding Finder
          </Link>
          <div className="flex items-center gap-2">
            <ThemeMenu />
            {owner && (
              <Button variant="outline" onClick={signOut}>
                <LogOut className="size-4" /> Sign out
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to room search
        </Link>

        {checkingSession ? (
          <div className="rounded-xl border p-8 text-center text-muted-foreground">
            Checking your account…
          </div>
        ) : owner ? (
          <div className="space-y-8">
            <section>
              <p className="text-sm font-medium text-primary">OWNER PORTAL</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Welcome, {owner.name}
              </h1>
              <p className="mt-2 text-muted-foreground">
                Create and manage the rooms you list on Boarding Finder.
              </p>
            </section>

            <section className="rounded-xl border bg-card p-5 sm:p-6">
              <h2 className="text-xl font-semibold">
                {editingId ? "Edit listing" : "Add a room"}
              </h2>
              <form
                id="owner-room-form"
                onSubmit={submitRoom}
                className="mt-5 grid gap-4 sm:grid-cols-2"
              >
                <label className="space-y-2 text-sm font-medium sm:col-span-2">
                  Listing title
                  <Input
                    required
                    maxLength={120}
                    value={form.title}
                    onChange={(event) => updateForm("title", event.target.value)}
                    placeholder="A bright room near campus"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium sm:col-span-2">
                  Description
                  <Textarea
                    required
                    maxLength={3000}
                    value={form.description}
                    onChange={(event) =>
                      updateForm("description", event.target.value)
                    }
                    placeholder="Describe the room, amenities, and house rules"
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Monthly price (Rs.)
                  <Input
                    required
                    type="number"
                    min="0.01"
                    step="any"
                    value={form.monthlyPrice || ""}
                    onChange={(event) =>
                      updateForm("monthlyPrice", Number(event.target.value))
                    }
                  />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  Distance to campus (km)
                  <Input
                    required
                    type="number"
                    min="0"
                    step="any"
                    value={form.distanceToCampusKm || ""}
                    onChange={(event) =>
                      updateForm("distanceToCampusKm", Number(event.target.value))
                    }
                  />
                </label>
                <label className="space-y-2 text-sm font-medium sm:col-span-2">
                  Boarding for
                  <select
                    required
                    value={form.boardingGender}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (isOwnerBoardingGender(value)) {
                        updateForm("boardingGender", value);
                      }
                    }}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    <option value="" disabled>
                      Choose who can stay
                    </option>
                    <option value="BOYS">Boys</option>
                    <option value="GIRLS">Girls</option>
                    <option value="ANY">Boys and girls</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium sm:col-span-2">
                  Address
                  <Input
                    required
                    maxLength={255}
                    value={form.address}
                    onChange={(event) => updateForm("address", event.target.value)}
                    placeholder="Street or neighborhood, city"
                  />
                </label>
                <div className="space-y-2 text-sm font-medium sm:col-span-2">
                  <label htmlFor="room-photo">Boarding photo</label>
                  <p className="font-normal text-muted-foreground">
                    Upload a JPEG, PNG, or WebP photo up to 5 MB.
                  </p>
                  {form.imageUrl ? (
                    <div className="relative max-w-sm overflow-hidden rounded-xl border">
                      <img
                        src={form.imageUrl}
                        alt="Preview of the boarding photo"
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute right-2 top-2 rounded-full"
                        aria-label="Remove boarding photo"
                        disabled={photoUploading}
                        onClick={() => updateForm("imageUrl", "")}
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ) : (
                    <label
                      htmlFor="room-photo"
                      className="flex min-h-32 max-w-sm cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 px-4 text-center text-muted-foreground transition-colors hover:bg-muted/60"
                    >
                      <ImagePlus className="size-7" />
                      <span>
                        {photoUploading
                          ? "Uploading photo…"
                          : "Choose a photo of this boarding"}
                      </span>
                    </label>
                  )}
                  <Input
                    id="room-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className={form.imageUrl ? "max-w-sm" : "sr-only"}
                    disabled={photoUploading}
                    aria-required="true"
                    aria-describedby="room-photo-help"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      void uploadPhoto(file);
                      event.target.value = "";
                    }}
                  />
                  <span id="room-photo-help" className="sr-only">
                    A photo is required before publishing this listing.
                  </span>
                </div>
                {error && (
                  <p role="alert" className="text-sm text-destructive sm:col-span-2">
                    {error}
                  </p>
                )}
                {notice && (
                  <p role="status" className="text-sm text-primary sm:col-span-2">
                    {notice}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 sm:col-span-2">
                  <Button type="submit" disabled={busy}>
                    <Plus className="size-4" />
                    {busy ? "Saving…" : editingId ? "Save changes" : "Publish room"}
                  </Button>
                  {editingId && (
                    <Button type="button" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </section>

            <section>
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Your listings</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {rooms.length} {rooms.length === 1 ? "room" : "rooms"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    cancelEdit();
                    document.getElementById("owner-room-form")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                >
                  <Plus className="size-4" /> Add room
                </Button>
              </div>
              {roomsLoading ? (
                <p className="rounded-xl border p-6 text-center text-muted-foreground">
                  Loading your listings…
                </p>
              ) : rooms.length === 0 ? (
                <div className="rounded-xl border border-dashed p-8 text-center">
                  <h3 className="font-medium">No listings yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add your first room using the form above.
                  </p>
                </div>
              ) : (
                <div className="divide-y rounded-xl border bg-card">
                  {rooms.map((room) => (
                    <article
                      key={room.id}
                      className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">{room.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {room.address}
                        </p>
                        <p className="mt-1 text-sm font-medium">
                          {formatPrice(room.monthlyPrice)}{" "}
                          <span className="font-normal text-muted-foreground">
                            / month
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          For {boardingGenderLabel(room.boardingGender).toLowerCase()}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(room)}
                        >
                          <Pencil className="size-4" /> Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => void removeRoom(room)}
                        >
                          <Trash2 className="size-4" /> Delete
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <section className="mx-auto max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium text-primary">OWNER PORTAL</p>
            <h1 className="mt-2 text-2xl font-semibold">
              {mode === "login" ? "Sign in to manage rooms" : "Create an owner account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your boarding listings from one place.
            </p>
            <form onSubmit={submitAuth} className="mt-6 space-y-4">
              {mode === "register" && (
                <label className="block space-y-2 text-sm font-medium">
                  Your name
                  <Input
                    required
                    maxLength={120}
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </label>
              )}
              <label className="block space-y-2 text-sm font-medium">
                Email address
                <Input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>
              <label className="block space-y-2 text-sm font-medium">
                Password
                <Input
                  required
                  type="password"
                  minLength={8}
                  maxLength={72}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                {mode === "register" && (
                  <span className="block font-normal text-muted-foreground">
                    Use at least 8 characters.
                  </span>
                )}
              </label>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              {notice && (
                <p role="status" className="text-sm text-primary">
                  {notice}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={busy}>
                {busy
                  ? "Please wait…"
                  : mode === "login"
                    ? "Sign in"
                    : "Create account"}
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              {mode === "login" ? "New to Boarding Finder?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="font-medium text-primary underline-offset-4 hover:underline"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setError("");
                }}
              >
                {mode === "login" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
