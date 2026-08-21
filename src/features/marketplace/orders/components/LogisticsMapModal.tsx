"use client";

import { useCallback, useRef } from "react";
import { Modal } from "antd";
import mapboxgl, { Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MockOrder } from "../mock-data";

// Reuses the same Mapbox-GL-over-Geoapify-tiles setup already keyed in this
// project for the mine-location picker (features/onboard/component/
// MineLocationPicker.tsx) - not a new map integration/dependency.
const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
const STYLE_URL = GEOAPIFY_KEY
  ? `https://maps.geoapify.com/v1/styles/osm-carto/style.json?apiKey=${GEOAPIFY_KEY}`
  : null;
mapboxgl.accessToken = "no-token-needed-using-geoapify-style";

export default function LogisticsMapModal({
  open,
  onClose,
  order,
}: {
  open: boolean;
  onClose: () => void;
  order: MockOrder;
}) {
  const mapRef = useRef<MapboxMap | null>(null);

  const setMapContainer = useCallback(
    (node: HTMLDivElement | null) => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (!node) return;

      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([order.origin.lng, order.origin.lat]);
      bounds.extend([order.destination.lng, order.destination.lat]);

      const map = new mapboxgl.Map({
        container: node,
        style: STYLE_URL || {
          version: 8,
          sources: {},
          layers: [{ id: "background", type: "background", paint: { "background-color": "#e5e7eb" } }],
        },
        bounds,
        fitBoundsOptions: { padding: 80 },
      });
      mapRef.current = map;
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

      new mapboxgl.Marker({ color: "#2563EB" }).setLngLat([order.origin.lng, order.origin.lat]).addTo(map);
      new mapboxgl.Marker({ color: "#DC2626" })
        .setLngLat([order.destination.lng, order.destination.lat])
        .addTo(map);

      const drawRoute = () => {
        const geojson = {
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "LineString" as const,
            coordinates: [
              [order.origin.lng, order.origin.lat],
              [order.destination.lng, order.destination.lat],
            ],
          },
        };
        if (!map.getSource("route-line")) {
          map.addSource("route-line", { type: "geojson", data: geojson });
          map.addLayer({
            id: "route-line-layer",
            type: "line",
            source: "route-line",
            paint: { "line-color": "#2563EB", "line-width": 3, "line-dasharray": [2, 2] },
          });
        }
      };
      if (map.isStyleLoaded()) drawRoute();
      else map.once("styledata", drawRoute);

      const resizeObserver = new ResizeObserver(() => map.resize());
      resizeObserver.observe(node);
      map.once("remove", () => resizeObserver.disconnect());
    },
    [order],
  );

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={860} title="Map" destroyOnClose>
      <div ref={setMapContainer} className="w-full h-[500px] rounded-lg overflow-hidden bg-gray-100" />
      {!GEOAPIFY_KEY && (
        <p className="text-xs text-gray-400 mt-2">
          Map tiles unavailable - set NEXT_PUBLIC_GEOAPIFY_API_KEY to enable satellite/street tiles.
        </p>
      )}
    </Modal>
  );
}
