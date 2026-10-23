"use client";

import { useEffect, useMemo, useState } from "react";
import { House, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "@/components/pagination";
import { RoomCard } from "@/components/room-card";
import { RoomGridSkeleton } from "@/components/room-grid-skeleton";
import { SearchFilters } from "@/components/search-filters";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { fetchPublicRooms } from "@/lib/api";
import {
  DEFAULT_FILTERS,
  type Room,
  type RoomFilters,
} from "@/lib/rooms";

const PAGE_SIZE = 8;
const FAVORITES_STORAGE_KEY = "boarding-finder-favorites";
const FILTER_KEYS = [
  "q",
  "maxPrice",
  "maxDistance",
  "boardingGender",
  "sort",
  "page",
] as const;

function filtersFromUrl(): { filters: RoomFilters; page: number } {
  const params = new URLSearchParams(window.location.search);
  const price = params.get("maxPrice") ?? "";
  const distanceParam = params.get("maxDistance");
  const distance = distanceParam === null ? Number.NaN : Number(distanceParam);
  const page = Number(params.get("page"));

  return {
    filters: {
      keyword: params.get("q") ?? "",
      maxPrice: price && Number(price) >= 0 ? price : "",
      maxDistance:
        Number.isFinite(distance) && distance >= 0
          ? Math.min(distance, 50)
          : DEFAULT_FILTERS.maxDistance,
      boardingGender: ["ALL", "BOYS", "GIRLS"].includes(
        params.get("boardingGender") ?? "",
      )
        ? (params.get("boardingGender") as RoomFilters["boardingGender"])
        : DEFAULT_FILTERS.boardingGender,
      sort: ["recommended", "price-asc", "price-desc", "distance"].includes(
        params.get("sort") ?? "",
      )
        ? (params.get("sort") as RoomFilters["sort"])
        : DEFAULT_FILTERS.sort,
    },
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

function writeUrl(filters: RoomFilters, page: number) {
  const url = new URL(window.location.href);
  for (const key of FILTER_KEYS) url.searchParams.delete(key);

  if (filters.keyword.trim()) url.searchParams.set("q", filters.keyword.trim());
  if (filters.maxPrice && Number(filters.maxPrice) >= 0) {
    url.searchParams.set("maxPrice", filters.maxPrice);
  }
  if (filters.maxDistance !== DEFAULT_FILTERS.maxDistance) {
    url.searchParams.set("maxDistance", String(filters.maxDistance));
  }
  if (filters.boardingGender !== DEFAULT_FILTERS.boardingGender) {
    url.searchParams.set("boardingGender", filters.boardingGender);
  }
  if (filters.sort !== DEFAULT_FILTERS.sort) {
    url.searchParams.set("sort", filters.sort);
  }
  if (page > 1) url.searchParams.set("page", String(page));

  window.history.pushState({}, "", url);
}

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [reloadToken, setReloadToken] = useState(0);
  const [filters, setFilters] = useState<RoomFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<RoomFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    const initial = filtersFromUrl();
    setFilters(initial.filters);
    setAppliedFilters(initial.filters);
    setPage(initial.page);

    const restoreFromHistory = () => {
      const current = filtersFromUrl();
      setFilters(current.filters);
      setAppliedFilters(current.filters);
      setPage(current.page);
    };
    window.addEventListener("popstate", restoreFromHistory);
    return () => window.removeEventListener("popstate", restoreFromHistory);
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every(Number.isInteger)) {
          setFavoriteIds(parsed as number[]);
        }
      }
    } catch {
      toast.error("Saved favorites could not be read from this browser.");
    } finally {
      setFavoritesLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!favoritesLoaded) return;
    try {
      window.localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(favoriteIds),
      );
    } catch {
      toast.error("Favorites could not be saved in this browser.");
    }
  }, [favoriteIds, favoritesLoaded]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRooms() {
      setIsLoading(true);
      setErrorMessage("");
      try {
        setRooms(await fetchPublicRooms(controller.signal));
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading rooms.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadRooms();
    return () => controller.abort();
  }, [reloadToken]);

  const filteredRooms = useMemo(() => {
    const keyword = appliedFilters.keyword.trim().toLocaleLowerCase();
    const maxPrice = appliedFilters.maxPrice
      ? Number(appliedFilters.maxPrice)
      : Number.POSITIVE_INFINITY;
    const matches = rooms.filter((room) => {
      const textMatch =
        !keyword ||
        [room.title, room.description, room.address, room.ownerName]
          .join(" ")
          .toLocaleLowerCase()
          .includes(keyword);
      return (
        textMatch &&
        room.monthlyPrice <= maxPrice &&
        room.distanceToCampusKm <= appliedFilters.maxDistance &&
        (appliedFilters.boardingGender === "ALL" ||
          room.boardingGender === "ANY" ||
          room.boardingGender === appliedFilters.boardingGender) &&
        (!showFavorites || favoriteIds.includes(room.id))
      );
    });

    switch (appliedFilters.sort) {
      case "price-asc":
        return matches.sort((a, b) => a.monthlyPrice - b.monthlyPrice);
      case "price-desc":
        return matches.sort((a, b) => b.monthlyPrice - a.monthlyPrice);
      case "distance":
        return matches.sort(
          (a, b) => a.distanceToCampusKm - b.distanceToCampusKm,
        );
      default:
        return matches;
    }
  }, [appliedFilters, favoriteIds, rooms, showFavorites]);

  const totalPages = Math.max(1, Math.ceil(filteredRooms.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleRooms = filteredRooms.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  function applyFilters() {
    const nextFilters = { ...filters, maxPrice: filters.maxPrice.trim() };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setPage(1);
    writeUrl(nextFilters, 1);
    setShowFavorites(false);
  }

  function changePage(nextPage: number) {
    const safePage = Math.max(1, Math.min(nextPage, totalPages));
    setPage(safePage);
    writeUrl(appliedFilters, safePage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleFavorite(roomId: number) {
    setFavoriteIds((current) =>
      current.includes(roomId)
        ? current.filter((id) => id !== roomId)
        : [...current, roomId],
    );
  }

  function showExplore() {
    setShowFavorites(false);
  }

  function showSavedFavorites() {
    setShowFavorites(true);
    setPage(1);
    writeUrl(appliedFilters, 1);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        onExplore={showExplore}
        onFavorites={showSavedFavorites}
        favoritesActive={showFavorites}
      />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-12 pt-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-primary">BOARDING FINDER</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Find your boarding near campus
          </h1>
          <p className="mt-3 text-muted-foreground">
            Browse nearby rooms and find one that fits your budget.
          </p>
        </div>

        <SearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          onApply={applyFilters}
        />

        <section className="mt-10" aria-labelledby="results-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="results-heading" className="text-xl font-semibold">
                {showFavorites ? "Your favorites" : "Available rooms"}
              </h2>
              {!isLoading && !errorMessage && (
                <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
                  {filteredRooms.length}{" "}
                  {filteredRooms.length === 1 ? "room" : "rooms"} found
                </p>
              )}
            </div>
          </div>

          {isLoading ? (
            <RoomGridSkeleton />
          ) : errorMessage ? (
            <div
              className="flex flex-col items-center rounded-xl border border-dashed px-5 py-12 text-center"
              role="alert"
            >
              <p className="font-medium">Rooms could not be loaded</p>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {errorMessage} Make sure the API is running and connected to
                PostgreSQL, then try again.
              </p>
              <Button
                className="mt-5"
                onClick={() => setReloadToken((token) => token + 1)}
              >
                <RotateCw className="size-4" /> Try again
              </Button>
            </div>
          ) : visibleRooms.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed px-5 py-14 text-center">
              <span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
                <House className="size-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-semibold">No rooms found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing your search or adjusting the filters.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    isFavorite={favoriteIds.includes(room.id)}
                    onFavoriteToggle={toggleFavorite}
                  />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={changePage}
              />
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
