import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

let optionsSet = false;

function ensureOptions() {
  if (optionsSet) return;
  setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "", v: "weekly" });
  optionsSet = true;
}

export function loadMapsLibrary() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("구글맵은 브라우저에서만 로드할 수 있습니다."));
  }
  ensureOptions();
  return importLibrary("maps");
}

export function loadMarkerLibrary() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("구글맵은 브라우저에서만 로드할 수 있습니다."));
  }
  ensureOptions();
  return importLibrary("marker");
}

export function loadPlacesLibrary() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("구글맵은 브라우저에서만 로드할 수 있습니다."));
  }
  ensureOptions();
  return importLibrary("places");
}

export interface PlaceSearchResult {
  placeId: string;
  name: string;
  address: string;
  category: string | null;
  latitude: number;
  longitude: number;
}

export async function searchPlaces(keyword: string, city?: string | null): Promise<PlaceSearchResult[]> {
  const { Place } = await loadPlacesLibrary();
  const textQuery = city ? `${keyword} ${city}` : keyword;

  const { places } = await Place.searchByText({
    textQuery,
    fields: ["id", "displayName", "formattedAddress", "location", "types"],
    maxResultCount: 15,
  });

  return places
    .filter((place) => place.location)
    .map((place) => ({
      placeId: place.id,
      name: place.displayName ?? "",
      address: place.formattedAddress ?? "",
      category: place.types?.[0]?.replaceAll("_", " ") ?? null,
      latitude: place.location!.lat(),
      longitude: place.location!.lng(),
    }));
}

export function googleMapsUrl(latitude: number, longitude: number, placeId?: string | null): string {
  const params = new URLSearchParams({ api: "1", query: `${latitude},${longitude}` });
  if (placeId) params.set("query_place_id", placeId);
  return `https://www.google.com/maps/search/?${params.toString()}`;
}
