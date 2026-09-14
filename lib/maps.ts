import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

// AMap JS API 2.0의 일부(우리가 실제로 쓰는 부분)만 다루는 최소 타입.
// 공식 타입 패키지가 없어 필요한 만큼만 직접 선언한다.
export interface AMapLngLat {
  lng?: number;
  lat?: number;
  getLng?: () => number;
  getLat?: () => number;
}

export interface AMapPoi {
  id: string;
  name: string;
  address?: string;
  district?: string;
  type?: string;
  location: AMapLngLat;
  opentime_today?: string;
  opentime_week?: string;
}

export interface AMapPlaceSearchResult {
  poiList?: { pois: AMapPoi[] };
}

export interface AMapPlaceSearchInstance {
  search(
    keyword: string,
    callback: (status: string, result: AMapPlaceSearchResult | string) => void
  ): void;
}

// 실제로 속성을 읽지 않고 그대로 다시 건네주기만 하는 opaque 핸들이라 unknown으로 둔다.
export type AMapLngLatInstance = unknown;

export type AMapPixelInstance = unknown;

export interface AMapMarkerInstance {
  setMap(map: AMapMapInstance | null): void;
  on(event: "click", handler: () => void): void;
  getPosition(): AMapLngLatInstance;
}

export interface AMapInfoWindowInstance {
  setContent(content: string): void;
  open(map: AMapMapInstance, position: AMapLngLatInstance): void;
}

export interface AMapMapInstance {
  setFitView(): void;
  destroy(): void;
}

export interface AMapNamespace {
  PlaceSearch: new (opts: { city?: string; pageSize?: number }) => AMapPlaceSearchInstance;
  Map: new (
    container: HTMLElement,
    opts: { zoom: number; center: [number, number] }
  ) => AMapMapInstance;
  Marker: new (opts: {
    position: [number, number];
    title?: string;
    label?: { content: string; direction: string };
  }) => AMapMarkerInstance;
  InfoWindow: new (opts?: { offset?: AMapPixelInstance }) => AMapInfoWindowInstance;
  Pixel: new (x: number, y: number) => AMapPixelInstance;
}

declare global {
  interface Window {
    _AMapSecurityConfig?: { securityJsCode: string };
    AMap: AMapNamespace;
  }
}

function assertBrowser(providerLabel: string) {
  if (typeof window === "undefined") {
    throw new Error(`${providerLabel}는 브라우저에서만 로드할 수 있습니다.`);
  }
}

let amapLoadPromise: Promise<AMapNamespace> | null = null;

function loadAMap(): Promise<AMapNamespace> {
  assertBrowser("고덕지도");
  const key = process.env.NEXT_PUBLIC_AMAP_KEY;
  if (!key) return Promise.reject(new Error("고덕지도 API 키가 설정되어 있지 않습니다."));

  if (!amapLoadPromise) {
    // @amap/amap-jsapi-loader는 모듈 최상단에서 window를 참조하므로, 정적 import로
    // 넣으면 서버 사이드 렌더링 시 "window is not defined"로 죽는다. 동적 import로
    // 브라우저에서 실제로 호출될 때만 로드한다.
    amapLoadPromise = import("@amap/amap-jsapi-loader").then(({ default: AMapLoader }) => {
      window._AMapSecurityConfig = {
        securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE ?? "",
      };
      return AMapLoader.load({
        key,
        version: "2.0",
        plugins: ["AMap.PlaceSearch", "AMap.Geocoder"],
      });
    });
  }

  return amapLoadPromise;
}

let googleOptionsSet = false;

function ensureGoogleOptions() {
  if (googleOptionsSet) return;
  setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "", v: "weekly" });
  googleOptionsSet = true;
}

function loadGoogleMapsLib() {
  assertBrowser("구글맵");
  ensureGoogleOptions();
  return importLibrary("maps");
}

function loadGoogleMarkerLib() {
  assertBrowser("구글맵");
  ensureGoogleOptions();
  return importLibrary("marker");
}

function loadGooglePlacesLib() {
  assertBrowser("구글맵");
  ensureGoogleOptions();
  return importLibrary("places");
}

export interface PlaceSearchResult {
  placeId: string;
  name: string;
  address: string;
  category: string | null;
  latitude: number;
  longitude: number;
  openingHours: string | null;
  coordinateSystem: "GCJ02" | "WGS84";
}

async function searchPlacesAMap(keyword: string, city?: string | null): Promise<PlaceSearchResult[]> {
  const AMap = await loadAMap();

  return new Promise((resolve, reject) => {
    const placeSearch = new AMap.PlaceSearch({
      city: city || undefined,
      pageSize: 15,
    });

    placeSearch.search(keyword, (status, result) => {
      if (status !== "complete" || typeof result === "string" || !result.poiList?.pois) {
        if (status === "no_data") {
          resolve([]);
          return;
        }
        reject(new Error(typeof result === "string" ? result : "고덕지도 검색에 실패했습니다."));
        return;
      }

      resolve(
        result.poiList.pois.map((poi) => ({
          placeId: poi.id,
          name: poi.name,
          address: poi.address || poi.district || "",
          category: poi.type || null,
          latitude: (poi.location.lat ?? poi.location.getLat?.()) as number,
          longitude: (poi.location.lng ?? poi.location.getLng?.()) as number,
          openingHours: poi.opentime_today || poi.opentime_week || null,
          coordinateSystem: "GCJ02" as const,
        }))
      );
    });
  });
}

async function searchPlacesGoogle(keyword: string, city?: string | null): Promise<PlaceSearchResult[]> {
  const { Place } = await loadGooglePlacesLib();
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
      openingHours: null,
      coordinateSystem: "WGS84" as const,
    }));
}

// 고덕지도를 우선 시도하고, 로드/검색에 실패하면(키 미설정 등) 구글맵으로 폴백한다.
export async function searchPlaces(keyword: string, city?: string | null): Promise<PlaceSearchResult[]> {
  try {
    return await searchPlacesAMap(keyword, city);
  } catch {
    return await searchPlacesGoogle(keyword, city);
  }
}

// ---------- TripMap 위젯이 쓰는 provider 핸들 ----------
export type MapHandle =
  | { provider: "amap"; AMap: AMapNamespace }
  | { provider: "google"; maps: google.maps.MapsLibrary; marker: google.maps.MarkerLibrary };

let mapProviderPromise: Promise<MapHandle> | null = null;

// 지도 위젯은 한 세션에서 하나의 provider만 쓴다(좌표계 혼용 방지).
export function loadMapProvider(): Promise<MapHandle> {
  if (!mapProviderPromise) {
    mapProviderPromise = loadAMap()
      .then((AMap): MapHandle => ({ provider: "amap", AMap }))
      .catch(async (): Promise<MapHandle> => {
        const [maps, marker] = await Promise.all([loadGoogleMapsLib(), loadGoogleMarkerLib()]);
        return { provider: "google", maps, marker };
      });
  }
  return mapProviderPromise;
}

export function amapUrl(latitude: number, longitude: number, name?: string | null): string {
  const params = new URLSearchParams({
    position: `${longitude},${latitude}`,
    name: name ?? "",
    src: "china-trip-planner",
    coordinate: "gaode",
    callnative: "1",
  });
  return `https://uri.amap.com/marker?${params.toString()}`;
}

export function googleMapsUrl(latitude: number, longitude: number, placeId?: string | null): string {
  const params = new URLSearchParams({ api: "1", query: `${latitude},${longitude}` });
  if (placeId) params.set("query_place_id", placeId);
  return `https://www.google.com/maps/search/?${params.toString()}`;
}

// 저장된 좌표계에 맞는 지도 딥링크를 돌려준다 (GCJ02 좌표를 구글맵 링크로 열면 위치가 어긋난다).
export function mapUrl(
  latitude: number,
  longitude: number,
  coordinateSystem: string,
  name?: string | null,
  placeId?: string | null
): string {
  return coordinateSystem === "GCJ02"
    ? amapUrl(latitude, longitude, name)
    : googleMapsUrl(latitude, longitude, placeId);
}
