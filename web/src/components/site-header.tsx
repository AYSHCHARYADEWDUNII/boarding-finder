"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeMenu } from "@/components/theme-menu";

type SiteHeaderProps = {
  onExplore: () => void;
  onFavorites: () => void;
  favoritesActive: boolean;
};

export function SiteHeader({
  onExplore,
  onFavorites,
  favoritesActive,
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={onExplore}
          className="inline-flex items-center gap-2 font-semibold tracking-tight"
          aria-label="Boarding Finder home"
        >
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            B
          </span>
          <span>Boarding Finder</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          <Button
            variant="ghost"
            onClick={onExplore}
            aria-current={!favoritesActive ? "page" : undefined}
          >
            Explore
          </Button>
          <Button
            variant="ghost"
            onClick={onFavorites}
            aria-current={favoritesActive ? "page" : undefined}
          >
            Favorites
          </Button>
          <ThemeMenu />
          <Button variant="outline" onClick={() => router.push("/owner")}>
            For owners
          </Button>
        </nav>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeMenu />
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon" aria-label="Open menu">
                  <Menu className="size-4" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-[min(20rem,85vw)]">
              <SheetHeader className="px-0">
                <SheetTitle>Boarding Finder</SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-2" aria-label="Mobile navigation">
                <SheetClose
                  render={
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={onExplore}
                    >
                      <Search className="size-4" /> Explore
                    </Button>
                  }
                />
                <SheetClose
                  render={
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={onFavorites}
                    >
                      Favorites
                    </Button>
                  }
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/owner");
                  }}
                >
                  For owners
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
