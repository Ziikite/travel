"use client";

import { useEffect, useRef } from "react";
import { loadMapProvider } from "@/lib/maps";

export interface MapPoint {
  id: string;
  name: string;
  longitude: number | null;
  latitude: number | null;
}

export function TripMap({ points, numbered = true }: { points: MapPoint[]; numbered?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let destroyed = false;
    // provider별로 정리 로직이 달라서, 브랜치 안에서 클로저 하나로 캡처해둔다.
    let cleanup: (() => void) | null = null;

    loadMapProvider()
      .then((handle) => {
        if (destroyed || !containerRef.current) return;
        const container = containerRef.current;
        const validPoints = points.filter(
          (p): p is MapPoint & { longitude: number; latitude: number } =>
            p.longitude != null && p.latitude != null
        );

        if (handle.provider === "amap") {
          const AMap = handle.AMap;
          const map = new AMap.Map(container, {
            zoom: 13,
            center: validPoints.length
              ? [validPoints[0].longitude, validPoints[0].latitude]
              : [116.397428, 39.90923],
          });

          const infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -30) });

          const markers = validPoints.map((p, idx) => {
            const marker = new AMap.Marker({
              position: [p.longitude, p.latitude],
              title: p.name,
              label: numbered ? { content: `${idx + 1}`, direction: "top" } : undefined,
            });
            marker.on("click", () => {
              infoWindow.setContent(p.name);
              infoWindow.open(map, marker.getPosition());
            });
            marker.setMap(map);
            return marker;
          });

          if (validPoints.length > 1) {
            map.setFitView();
          }

          cleanup = () => {
            markers.forEach((m) => m.setMap(null));
            map.destroy();
          };
        } else {
          const { Map, InfoWindow } = handle.maps;
          const { Marker } = handle.marker;

          const map = new Map(container, {
            zoom: 13,
            center: validPoints.length
              ? { lat: validPoints[0].latitude, lng: validPoints[0].longitude }
              : { lat: 39.90923, lng: 116.397428 },
          });

          const infoWindow = new InfoWindow();

          const markers = validPoints.map((p, idx) => {
            const marker = new Marker({
              position: { lat: p.latitude, lng: p.longitude },
              map,
              title: p.name,
              label: numbered ? `${idx + 1}` : undefined,
            });
            marker.addListener("click", () => {
              infoWindow.setContent(p.name);
              infoWindow.open({ anchor: marker, map });
            });
            return marker;
          });

          if (validPoints.length > 1) {
            const lats = validPoints.map((p) => p.latitude);
            const lngs = validPoints.map((p) => p.longitude);
            map.fitBounds({
              north: Math.max(...lats),
              south: Math.min(...lats),
              east: Math.max(...lngs),
              west: Math.min(...lngs),
            });
          }

          cleanup = () => {
            markers.forEach((m) => m.setMap(null));
          };
        }

        if (destroyed) {
          cleanup();
          cleanup = null;
        }
      })
      .catch(() => {
        // 두 지도 provider 모두 로드에 실패해도 나머지 기능은 그대로 동작해야 한다.
      });

    return () => {
      destroyed = true;
      cleanup?.();
    };
  }, [points, numbered]);

  return (
    <div
      ref={containerRef}
      className="h-64 w-full rounded-xl bg-surface-sunken text-sm text-ink-muted dark:bg-zinc-800"
    />
  );
}
