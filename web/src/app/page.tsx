"use client";

import { useEffect, useState } from "react";
import { ArrowRight, MapPin, Search } from "lucide-react";

type Room = {
  id: number;
  title: string;
  description: string;
  monthlyPrice: number;
  address: string;
  distanceToCampusKm: number;
  imageUrl: string | null;
  ownerName: string;
  createdAt: string;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function HomePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadRooms() {
      try {
        const response = await fetch(`${apiBaseUrl}/api/rooms`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error("We couldn't load rooms right now. Please try again.");
        }
        setRooms((await response.json()) as Room[]);
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
  }, []);

  return (
    <main className="min-h-screen">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Boarding Finder home">
          <span className="brand-mark">B</span>
          <span>boarding<span className="brand-accent">finder</span></span>
        </a>
        <nav className="header-nav" aria-label="Main navigation">
          <a href="#rooms">Explore rooms</a>
          <a className="owner-link" href="#rooms">List your room <ArrowRight size={15} /></a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT CHAPTER STARTS HERE</p>
          <h1>Find a place<br />to <span>feel at home.</span></h1>
          <p className="hero-copy">
            Thoughtful stays, closer to campus. Discover a room that fits your
            life, your budget, and your next big idea.
          </p>
          <a className="hero-cta" href="#rooms">Explore available rooms <ArrowRight size={17} /></a>
          <div className="hero-note">
            <div className="avatar-stack" aria-hidden="true">
              <span>J</span><span>M</span><span>A</span>
            </div>
            <span>Helping students find their place</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="sun-shape" />
          <div className="art-window">
            <div className="window-sky"><span className="window-sun" /></div>
            <div className="window-sill" />
            <div className="window-plant"><i /><i /><i /><i /></div>
          </div>
          <div className="art-room">
            <div className="room-wall" />
            <div className="room-bed"><div className="bed-pillow" /><div className="bed-throw" /></div>
            <div className="room-table"><div className="table-vase" /></div>
            <div className="room-rug" />
          </div>
          <div className="art-caption"><span>01 / 08</span><span>A little closer to campus</span></div>
          <div className="art-sticker">YOUR<br />SPACE<br /><span>AWAITS</span></div>
        </div>
      </section>

      <section className="search-wrap" aria-label="Search rooms">
        <div className="search-intro">
          <Search size={18} />
          <span>Start your search</span>
        </div>
        <label className="search-field">
          <span>LOCATION</span>
          <span className="search-value">Near your campus</span>
        </label>
        <label className="search-field">
          <span>MONTHLY BUDGET</span>
          <span className="search-value">Any price</span>
        </label>
        <a className="search-button" href="#rooms">Find a room <ArrowRight size={16} /></a>
      </section>

      <section className="listings-section" id="rooms">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A GOOD PLACE TO BEGIN</p>
            <h2>Rooms worth <span>coming home to.</span></h2>
          </div>
          <p className="section-subtitle">A few lovely places, picked for life near campus.</p>
        </div>

        {isLoading ? (
          <div className="room-grid" aria-label="Loading rooms">
            {Array.from({ length: 3 }, (_, index) => (
              <div className="room-card skeleton-card" key={index}>
                <div className="skeleton-image" />
                <div className="skeleton-line short" />
                <div className="skeleton-line" />
              </div>
            ))}
          </div>
        ) : errorMessage ? (
          <div className="status-panel" role="alert">
            <p>{errorMessage}</p>
            <span>Make sure the API is running and connected to PostgreSQL, then refresh this page.</span>
          </div>
        ) : rooms.length === 0 ? (
          <div className="status-panel">
            <p>No rooms listed just yet.</p>
            <span>Check back soon for places near your campus.</span>
          </div>
        ) : (
          <div className="room-grid">
            {rooms.map((room, index) => (
              <article className="room-card" key={room.id}>
                <div
                  className={`room-image room-image-${(index % 3) + 1}`}
                  style={room.imageUrl ? { backgroundImage: `url("${room.imageUrl}")` } : undefined}
                >
                  <span className="room-tag">Near campus</span>
                  <button className="favorite-button" type="button" aria-label={`Save ${room.title} to favorites`}>♡</button>
                </div>
                <div className="room-card-body">
                  <div className="room-card-title">
                    <h3>{room.title}</h3>
                    <span className="room-price">{formatPrice(room.monthlyPrice)}<small> / mo</small></span>
                  </div>
                  <p className="room-address"><MapPin size={14} /> {room.address}</p>
                  <p className="room-description">{room.description}</p>
                  <div className="room-card-footer">
                    <span>{room.distanceToCampusKm} km to campus</span>
                    <span>Hosted by {room.ownerName}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <footer className="site-footer">
        <a className="brand" href="/">
          <span className="brand-mark">B</span>
          <span>boarding<span className="brand-accent">finder</span></span>
        </a>
        <span>Find your place. Make it yours.</span>
      </footer>
    </main>
  );
}
