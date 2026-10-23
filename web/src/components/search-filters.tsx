"use client";

import { useState, type FormEvent } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import type { RoomFilters } from "@/lib/rooms";

type SearchFiltersProps = {
  filters: RoomFilters;
  onFiltersChange: (filters: RoomFilters) => void;
  onApply: () => void;
};

function isBoardingGenderFilter(
  value: string,
): value is RoomFilters["boardingGender"] {
  return value === "ALL" || value === "BOYS" || value === "GIRLS";
}

export function SearchFilters({
  filters,
  onFiltersChange,
  onApply,
}: SearchFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const update = (patch: Partial<RoomFilters>) =>
    onFiltersChange({ ...filters, ...patch });
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply();
  };

  const keywordInput = (id: string) => (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        Search
      </label>
      <Input
        id={id}
        value={filters.keyword}
        onChange={(event) => update({ keyword: event.target.value })}
        placeholder="Keyword or area"
        autoComplete="off"
      />
    </div>
  );

  const priceInput = (id: string) => (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        Max monthly price (Rs.)
      </label>
      <Input
        id={id}
        type="number"
        min="0"
        inputMode="numeric"
        value={filters.maxPrice}
        onChange={(event) => update({ maxPrice: event.target.value })}
        placeholder="Any price"
      />
    </div>
  );

  const distanceInput = (id: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          Max distance
        </label>
        <span className="text-sm text-muted-foreground">
          {filters.maxDistance} km
        </span>
      </div>
      <Slider
        id={id}
        aria-label="Maximum distance in kilometers"
        min={0}
        max={50}
        step={0.5}
        value={[filters.maxDistance]}
        onValueChange={(value) =>
          update({
            maxDistance: Array.isArray(value) ? value[0] : value,
          })
        }
      />
    </div>
  );

  const sortSelect = (id: string) => (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        Sort by
      </label>
      <Select value={filters.sort} onValueChange={(sort) => sort && update({ sort })}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue>
            {{
              recommended: "Recommended",
              "price-asc": "Price: low to high",
              "price-desc": "Price: high to low",
              distance: "Distance: nearest",
            }[filters.sort]}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recommended">Recommended</SelectItem>
          <SelectItem value="price-asc">Price: low to high</SelectItem>
          <SelectItem value="price-desc">Price: high to low</SelectItem>
          <SelectItem value="distance">Distance: nearest</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  const boardingGenderSelect = (id: string) => (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        Boarding for
      </label>
      <Select
        value={filters.boardingGender}
        onValueChange={(boardingGender) => {
          if (boardingGender && isBoardingGenderFilter(boardingGender)) {
            update({ boardingGender });
          }
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue>
            {{
              ALL: "All",
              BOYS: "Boys",
              GIRLS: "Girls",
            }[filters.boardingGender]}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All</SelectItem>
          <SelectItem value="BOYS">Boys</SelectItem>
          <SelectItem value="GIRLS">Girls</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <section aria-label="Search rooms" className="mt-8">
      <form
        onSubmit={submit}
        className="hidden items-end gap-4 rounded-xl border bg-card p-4 shadow-sm lg:grid lg:grid-cols-[minmax(12rem,1.5fr)_minmax(9rem,1fr)_minmax(10rem,1fr)_minmax(9rem,1fr)_minmax(10rem,1fr)_auto]"
      >
        {keywordInput("desktop-keyword")}
        {priceInput("desktop-price")}
        {distanceInput("desktop-distance")}
        {boardingGenderSelect("desktop-boarding-gender")}
        {sortSelect("desktop-sort")}
        <Button type="submit" className="w-full">
          <Search className="size-4" /> Search
        </Button>
      </form>

      <form onSubmit={submit} className="flex gap-2 lg:hidden">
        <div className="min-w-0 flex-1">{keywordInput("mobile-keyword")}</div>
        <div className="flex items-end gap-2">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button type="button" variant="outline" aria-label="Open filters">
                  <SlidersHorizontal className="size-4" />
                  <span>Filters</span>
                </Button>
              }
            />
            <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Narrow down rooms by budget, distance, and sorting.
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 px-4 pb-4">
                {priceInput("mobile-price")}
                {distanceInput("mobile-distance")}
                {boardingGenderSelect("mobile-boarding-gender")}
                {sortSelect("mobile-sort")}
              </div>
              <SheetFooter>
                <Button
                  onClick={() => {
                    onApply();
                    setMobileOpen(false);
                  }}
                >
                  Show rooms
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <Button type="submit" size="icon" aria-label="Search rooms">
            <Search className="size-4" />
          </Button>
        </div>
      </form>
    </section>
  );
}
