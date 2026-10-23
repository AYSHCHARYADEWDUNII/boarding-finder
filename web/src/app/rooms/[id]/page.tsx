"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, House, MapPin } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ThemeMenu } from "@/components/theme-menu";
import { fetchPublicRoom } from "@/lib/api";
import {
  boardingGenderLabel,
  formatDistance,
  formatPrice,
  type Room,
} from "@/lib/rooms";

export default function RoomDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function loadRoom() {
      setLoading(true);
      setError("");
      try {
        const result = await fetchPublicRoom(id, controller.signal);
        if (!controller.signal.aborted) setRoom(result);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "This room could not be loaded.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    if (id) void loadRoom();
    return () => controller.abort();
  }, [id]);

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
          <ThemeMenu />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/" className={buttonVariants({ variant: "ghost" })}>
          <ArrowLeft className="size-4" /> Back to rooms
        </Link>

        {loading ? (
          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
            <div className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
              <div className="h-24 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ) : error || !room ? (
          <section className="mt-8 rounded-xl border border-dashed px-5 py-14 text-center">
            <h1 className="text-xl font-semibold">Room details unavailable</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {error || "This room may have been removed."}
            </p>
            <Link href="/" className={`${buttonVariants()} mt-5`}>
              Browse rooms
            </Link>
          </section>
        ) : (
          <article className="mt-6 grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
            <div className="overflow-hidden rounded-2xl border bg-muted">
              {room.imageUrl ? (
                <img
                  src={room.imageUrl}
                  alt={`Boarding room: ${room.title}`}
                  className="aspect-[4/3] w-full object-cover"
                />
              ) : (
                <div
                  className="grid aspect-[4/3] place-items-center text-muted-foreground"
                  role="img"
                  aria-label={`No photo available for ${room.title}`}
                >
                  <House className="size-16" strokeWidth={1.5} aria-hidden="true" />
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5 sm:p-7">
              <p className="text-sm font-medium text-primary">ROOM DETAILS</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {room.title}
              </h1>
              <p className="mt-3 flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {room.address}
              </p>
              <p className="mt-3 inline-flex rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
                For {boardingGenderLabel(room.boardingGender).toLowerCase()}
              </p>

              <div className="mt-6 rounded-xl bg-muted/70 p-4">
                <p className="text-2xl font-semibold">
                  {formatPrice(room.monthlyPrice)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / month
                  </span>
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatDistance(room.distanceToCampusKm)} km from campus
                </p>
              </div>

              <section className="mt-7">
                <h2 className="font-semibold">About this room</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {room.description}
                </p>
              </section>

              <section className="mt-7 border-t pt-5">
                <h2 className="font-semibold">Hosted by</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {room.ownerName}
                </p>
              </section>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
