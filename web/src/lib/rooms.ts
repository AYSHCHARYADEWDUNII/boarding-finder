export type Room = {
  id: number;
  title: string;
  description: string;
  monthlyPrice: number;
  address: string;
  distanceToCampusKm: number;
  imageUrl: string | null;
  boardingGender: BoardingGender;
  ownerName: string;
  createdAt: string;
};

export type BoardingGender = "BOYS" | "GIRLS" | "ANY" | "UNSPECIFIED";

export type RoomFilters = {
  keyword: string;
  maxPrice: string;
  maxDistance: number;
  boardingGender: "ALL" | "BOYS" | "GIRLS";
  sort: string;
};

export const DEFAULT_FILTERS: RoomFilters = {
  keyword: "",
  maxPrice: "",
  maxDistance: 50,
  boardingGender: "ALL",
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
