import AMapLoader from "@amap/amap-jsapi-loader";

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

export interface AMapMarkerInstance {
  setMap(map: AMapMapInstance | null): void;
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
}

declare global {
  interface Window {
    _AMapSecurityConfig?: { securityJsCode: string };
    AMap: AMapNamespace;
  }
}

let loadPromise: Promise<AMapNamespace> | null = null;

export function loadAMap(): Promise<AMapNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("AMap은 브라우저에서만 로드할 수 있습니다."));
  }

  if (!loadPromise) {
    window._AMapSecurityConfig = {
      securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE ?? "",
    };
    loadPromise = AMapLoader.load({
      key: process.env.NEXT_PUBLIC_AMAP_KEY ?? "",
      version: "2.0",
      plugins: ["AMap.PlaceSearch", "AMap.Geocoder", "AMap.Driving", "AMap.Walking", "AMap.Transfer"],
    });
  }

  return loadPromise;
}

export interface AMapPoiResult {
  amapPoiId: string;
  name: string;
  address: string;
  category: string | null;
  latitude: number;
  longitude: number;
  openingHours: string | null;
}

export async function searchPlaces(keyword: string, city?: string | null): Promise<AMapPoiResult[]> {
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
        reject(new Error(typeof result === "string" ? result : "장소 검색에 실패했습니다."));
        return;
      }

      const pois = result.poiList.pois.map((poi) => ({
        amapPoiId: poi.id,
        name: poi.name,
        address: poi.address || poi.district || "",
        category: poi.type || null,
        latitude: (poi.location.lat ?? poi.location.getLat?.()) as number,
        longitude: (poi.location.lng ?? poi.location.getLng?.()) as number,
        openingHours: poi.opentime_today || poi.opentime_week || null,
      }));

      resolve(pois);
    });
  });
}

export function amapMarkerUrl(name: string, longitude: number, latitude: number): string {
  const params = new URLSearchParams({
    position: `${longitude},${latitude}`,
    name,
    src: "china-trip-planner",
    coordinate: "gaode",
    callnative: "1",
  });
  return `https://uri.amap.com/marker?${params.toString()}`;
}
