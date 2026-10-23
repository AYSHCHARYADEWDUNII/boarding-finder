"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, House, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  boardingGenderLabel,
  formatDistance,
  formatPrice,
  type Room,
} from "@/lib/rooms";

type RoomCardProps = {
  room: Room;
  isFavorite: boolean;
  onFavoriteToggle: (roomId: number) => void;
};

export function RoomCard({
  room,
  isFavorite,
  onFavoriteToggle,
}: RoomCardProps) {
  const router = useRouter();
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(room.imageUrl) && !imageFailed;

  return (
    <Card className="flex h-full flex-col overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] bg-muted">
        {showImage ? (
          <img
            src={room.imageUrl ?? undefined}
            alt={`Boarding room: ${room.title}`}
            className="size-full object-cover"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className="grid size-full place-items-center text-muted-foreground"
            role="img"
            aria-label={`No photo available for ${room.title}`}
          >
            <House className="size-10" strokeWidth={1.5} aria-hidden="true" />
          </div>
        )}
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute right-3 top-3 rounded-full bg-background/90 shadow-sm hover:bg-background"
          aria-label={
            isFavorite
              ? `Remove ${room.title} from favorites`
              : `Add ${room.title} to favorites`
          }
          aria-pressed={isFavorite}
          onClick={() => onFavoriteToggle(room.id)}
        >
          <Heart
            className={`size-4 ${isFavorite ? "fill-primary text-primary" : ""}`}
          />
        </Button>
      </div>
      <CardHeader className="space-y-2 p-4 pb-2">
        <h2 className="line-clamp-1 text-base font-semibold leading-6">
          {room.title}
        </h2>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{room.address}</span>
        </p>
      </CardHeader>
      <CardContent className="flex-1 space-y-3 px-4 pb-4 pt-2">
        <p className="text-base font-semibold">
          {formatPrice(room.monthlyPrice)}
          <span className="font-normal text-muted-foreground"> / month</span>
        </p>
        <Badge variant="secondary" className="font-normal">
          {formatDistance(room.distanceToCampusKm)} km from campus
        </Badge>
        <Badge variant="outline" className="ml-2 font-normal">
          {boardingGenderLabel(room.boardingGender)}
        </Badge>
      </CardContent>
      <CardFooter className="p-4 pt-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => router.push(`/rooms/${room.id}`)}
        >
          View details
        </Button>
      </CardFooter>
    </Card>
  );
}
