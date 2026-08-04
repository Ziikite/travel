"use client";

import { useEffect, useRef } from "react";
import { loadMapsLibrary, loadMarkerLibrary } from "@/lib/maps";

export interface MapPoint {
  id: string;
  name: string;
  longitude: number | null;
  latitude: number | null;
}

export function TripMap({ points }: { points: MapPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let destroyed = false;
    let markers: google.maps.Marker[] = [];

    Promise.all([loadMapsLibrary(), loadMarkerLibrary()])
      .then(([{ Map }, { Marker }]) => {
        if (destroyed || !containerRef.current) return;
        const validPoints = points.filter(
          (p): p is MapPoint & { longitude: number; latitude: number } =>
            p.longitude != null && p.latitude != null
        );

        const map = new Map(containerRef.current, {
          zoom: 13,
          center: validPoints.length
            ? { lat: validPoints[0].latitude, lng: validPoints[0].longitude }
            : { lat: 39.90923, lng: 116.397428 },
        });

        markers = validPoints.map(
          (p, idx) =>
            new Marker({
              position: { lat: p.latitude, lng: p.longitude },
              map,
              title: p.name,
              label: `${idx + 1}`,
            })
        );

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
      })
      .catch(() => {
        // 구글맵 키가 없거나 로드에 실패해도 나머지 기능은 그대로 동작해야 한다.
      });

    return () => {
      destroyed = true;
      markers.forEach((m) => m.setMap(null));
    };
  }, [points]);

  return (
    <div
      ref={containerRef}
      className="h-64 w-full rounded-xl bg-zinc-100 text-sm text-zinc-400 dark:bg-zinc-800"
    />
  );
}
