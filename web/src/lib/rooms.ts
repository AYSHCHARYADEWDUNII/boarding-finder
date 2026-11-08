export type Room = {
  id: number;
  title: string;
  description: string;
  monthlyPrice: number;
  address: string;
  distanceToCampusKm: number;
  imageUrl: string | null;
  imageUrls: string[];
  boardingFor: BoardingGender;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  contactEmail: string | null;
  latitude: number | null;
  longitude: number | null;
  ownerName: string;
  createdAt: string;
};

export type BoardingGender = "BOYS" | "GIRLS" | "ANY" | "UNSPECIFIED";

export type RoomFilters = {
  keyword: string;
  maxPrice: string;
  maxDistance: string;
  boardingFor: "ALL" | "BOYS" | "GIRLS";
  sort: string;
};

export const DEFAULT_FILTERS: RoomFilters = {
  keyword: "",
  maxPrice: "",
  maxDistance: "",
  boardingFor: "ALL",
  sort: "recommended",
};

export function boardingGenderLabel(gender: BoardingGender) {
  switch (gender) {
    case "BOYS":
      return "Boys";
    case "GIRLS":
      return "Girls";
    case "ANY":
      return "Boys and girls";
    default:
      return "Not specified";
  }
}

export function roomImageUrls(room: Pick<Room, "imageUrl" | "imageUrls">) {
  return room.imageUrls?.length
    ? room.imageUrls
    : room.imageUrl
      ? [room.imageUrl]
      : [];
}

export function formatPrice(price: number) {
  return `Rs. ${new Intl.NumberFormat("en-LK", {
    maximumFractionDigits: 0,
  }).format(price)}`;
}

export function formatDistance(distance: number) {
  return new Intl.NumberFormat("en-LK", {
    maximumFractionDigits: 1,
  }).format(distance);
}
