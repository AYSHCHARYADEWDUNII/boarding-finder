import type { BoardingGender, Room } from "@/lib/rooms";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export type Owner = {
  id: number;
  name: string;
  email: string;
};

export type RoomInput = Omit<
  Room,
  "id" | "ownerName" | "createdAt" | "boardingGender"
> & { boardingGender: Exclude<BoardingGender, "UNSPECIFIED"> };

async function csrfToken() {
  const response = await fetch(`${apiBaseUrl}/api/auth/csrf`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Could not start a secure session. Please try again.");
  }
  const body = (await response.json()) as { token: string };
  return body.token;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    headers.set("X-XSRF-TOKEN", await csrfToken());
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers,
      credentials: "include",
      cache: "no-store",
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Cannot connect to the Boarding Finder API at ${apiBaseUrl}. Make sure the backend is running.`,
      );
    }
    throw error;
  }
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { message?: string; detail?: string }
      | null;
    throw new Error(
      body?.message ??
        body?.detail ??
        `Request failed (${response.status}). Please try again.`,
    );
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export async function fetchPublicRoom(
  id: string,
  signal?: AbortSignal,
): Promise<Room> {
  return apiRequest<Room>(`/api/rooms/${encodeURIComponent(id)}`, { signal });
}

export async function fetchPublicRooms(signal?: AbortSignal): Promise<Room[]> {
  return apiRequest<Room[]>("/api/rooms", { signal });
}

export async function fetchOwnerRooms(): Promise<Room[]> {
  return apiRequest<Room[]>("/api/owner/rooms");
}

export async function saveOwnerRoom(room: RoomInput, id?: number): Promise<Room> {
  return apiRequest<Room>(id ? `/api/owner/rooms/${id}` : "/api/owner/rooms", {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(room),
  });
}

export async function deleteOwnerRoom(id: number): Promise<void> {
  await apiRequest<void>(`/api/owner/rooms/${id}`, { method: "DELETE" });
}

export async function uploadOwnerRoomPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.set("file", file);
  const result = await apiRequest<{ imageUrl: string }>(
    "/api/owner/rooms/images",
    {
      method: "POST",
      body: formData,
    },
  );
  return result.imageUrl;
}

export { apiBaseUrl };
