"use client";

import { useEffect, useRef } from "react";
import { loadAMap, type AMapMapInstance, type AMapMarkerInstance } from "@/lib/amap";

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
    let map: AMapMapInstance | null = null;
    let markers: AMapMarkerInstance[] = [];

    loadAMap()
      .then((AMap) => {
        if (destroyed || !containerRef.current) return;
        const validPoints = points.filter(
          (p): p is MapPoint & { longitude: number; latitude: number } =>
            p.longitude != null && p.latitude != null
        );

        map = new AMap.Map(containerRef.current, {
          zoom: 13,
          center: validPoints.length
            ? [validPoints[0].longitude, validPoints[0].latitude]
            : [116.397428, 39.90923],
        });

        markers = validPoints.map((p, idx) => {
          const marker = new AMap.Marker({
            position: [p.longitude, p.latitude],
            title: p.name,
            label: { content: `${idx + 1}`, direction: "top" },
          });
          marker.setMap(map);
          return marker;
        });

        if (validPoints.length > 1) {
          map.setFitView();
        }
      })
      .catch(() => {
        // 고덕지도 키가 없거나 로드에 실패해도 나머지 기능은 그대로 동작해야 한다.
      });

    return () => {
      destroyed = true;
      markers.forEach((m) => m.setMap(null));
      map?.destroy();
    };
  }, [points]);

  return (
    <div
      ref={containerRef}
      className="h-64 w-full rounded-xl bg-zinc-100 text-sm text-zinc-400 dark:bg-zinc-800"
    />
  );
}
