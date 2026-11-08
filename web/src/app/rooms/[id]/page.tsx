"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, House, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Carousel } from "@/components/ui/carousel";
import { ThemeMenu } from "@/components/theme-menu";
import { fetchPublicRoom } from "@/lib/api";
import {
  boardingGenderLabel,
  formatDistance,
  formatPrice,
  roomImageUrls,
  type Room,
} from "@/lib/rooms";

const RoomMap = dynamic(
  () => import("@/components/room-map").then((module) => module.RoomMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 animate-pulse rounded-xl bg-muted" aria-label="Loading map" />
    ),
  },
);

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

  const whatsappDigits = room?.contactWhatsapp?.replace(/\D/g, "");

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
          <article className="mt-6 space-y-8">
            {(() => {
              const images = roomImageUrls(room);
              return (
                <section aria-label="Room photos">
                  {images.length > 0 ? (
                    <div className="relative grid aspect-[16/9] max-h-[34rem] grid-cols-1 gap-2 overflow-hidden rounded-2xl bg-muted sm:grid-cols-2">
                      <img
                        src={images[0]}
                        alt={`${room.title}, photo 1`}
                        className="size-full min-h-0 object-cover sm:row-span-2"
                      />
                      {images.slice(1, 3).map((imageUrl, index) => (
                        <img
                          key={`${imageUrl}-${index}`}
                          src={imageUrl}
                          alt={`${room.title}, photo ${index + 2}`}
                          className="hidden size-full min-h-0 object-cover sm:block"
                        />
                      ))}
                      <Dialog>
                        <DialogTrigger
                          className="absolute bottom-4 right-4 inline-flex h-9 items-center justify-center rounded-md border bg-background/95 px-3 text-sm font-medium shadow-sm transition-colors hover:bg-background"
                        >
                          See all photos ({images.length})
                        </DialogTrigger>
                        <DialogContent>
                          <DialogTitle className="mb-4 pr-10">
                            Photos of {room.title}
                          </DialogTitle>
                          <DialogDescription className="sr-only">
                            Browse all photos for this boarding.
                          </DialogDescription>
                          <Carousel images={images} title={room.title} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <div
                      className="grid aspect-[16/9] place-items-center rounded-2xl border bg-muted text-muted-foreground"
                      role="img"
                      aria-label={`No photo available for ${room.title}`}
                    >
                      <House className="size-16" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                  )}
                </section>
              );
            })()}

            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      {room.title}
                    </h1>
                    <p className="mt-3 flex items-start gap-2 text-muted-foreground">
                      <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      {room.address}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    For {boardingGenderLabel(room.boardingFor).toLowerCase()}
                  </Badge>
                </div>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>About this room</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line leading-7 text-muted-foreground">
                      {room.description}
                    </p>
                  </CardContent>
                </Card>

                {room.latitude !== null &&
                  room.longitude !== null &&
                  Number.isFinite(room.latitude) &&
                  Number.isFinite(room.longitude) && (
                    <section className="mt-6 space-y-3">
                      <h2 className="text-lg font-semibold">Location</h2>
                      <RoomMap
                        latitude={room.latitude}
                        longitude={room.longitude}
                        title={room.title}
                      />
                    </section>
                  )}
              </div>

              <aside className="space-y-5">
                <Card>
                  <CardContent className="pt-5">
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
                    <div className="mt-5 border-t pt-4">
                      <h2 className="font-semibold">Hosted by</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {room.ownerName}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact the owner</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2">
                    {room.contactPhone && (
                      <Button render={<a href={`tel:${room.contactPhone}`} />}>
                        <Phone className="size-4" /> Call
                      </Button>
                    )}
                    {whatsappDigits && (
                      <Button
                        variant="outline"
                        render={
                          <a
                            href={`https://wa.me/${whatsappDigits}`}
                            target="_blank"
                            rel="noreferrer"
                          />
                        }
                      >
                        <MessageCircle className="size-4" /> WhatsApp
                      </Button>
                    )}
                    {room.contactEmail && (
                      <Button
                        variant="outline"
                        render={<a href={`mailto:${room.contactEmail}`} />}
                      >
                        <Mail className="size-4" /> Email
                      </Button>
                    )}
                    {!room.contactPhone &&
                      !room.contactWhatsapp &&
                      !room.contactEmail && (
                        <p className="text-sm text-muted-foreground">
                          Contact details are not available for this listing.
                        </p>
                      )}
                  </CardContent>
                </Card>
              </aside>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}
