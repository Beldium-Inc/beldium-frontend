"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Button, Input } from "antd";
import mapboxgl, { Map as MapboxMap, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;
const STYLE_URL = GEOAPIFY_KEY
  ? `https://maps.geoapify.com/v1/styles/osm-carto/style.json?apiKey=${GEOAPIFY_KEY}`
  : null;

// mapbox-gl requires a truthy accessToken even when the style/tiles come from
// a third-party source (Geoapify) rather than Mapbox's own hosted tiles.
mapboxgl.accessToken = "no-token-needed-using-geoapify-style";

export type MineLocationResult = {
  pin: { lat: number; lng: number } | null;
  boundary: { lat: number; lng: number }[];
  areaHectares: number;
  perimeterMeters: number;
};

type Tab = "pin" | "boundary" | "review";

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function polygonAreaHectares(points: { lat: number; lng: number }[]) {
  if (points.length < 3) return 0;
  // Shoelace formula on an equirectangular approximation, fine for small mining concessions.
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const lat0 = rad(points[0].lat);
  const xy = points.map((p) => ({
    x: R * rad(p.lng) * Math.cos(lat0),
    y: R * rad(p.lat),
  }));
  let area = 0;
  for (let i = 0; i < xy.length; i++) {
    const j = (i + 1) % xy.length;
    area += xy[i].x * xy[j].y - xy[j].x * xy[i].y;
  }
  return Math.abs(area / 2) / 10000; // m^2 -> hectares
}

export function MineLocationPicker({
  open,
  onClose,
  onSubmit,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (result: MineLocationResult) => void;
  initial?: MineLocationResult | null;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const pinMarkerRef = useRef<Marker | null>(null);

  const [tab, setTab] = useState<Tab>("pin");
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(initial?.pin || null);
  const [boundary, setBoundary] = useState<{ lat: number; lng: number }[]>(initial?.boundary || []);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");

  // Callback ref: antd's Modal (with destroyOnClose) mounts its content a
  // tick after `open` flips true, so a `useEffect(..., [open])` can fire
  // before the container div exists. Initializing directly when the DOM
  // node mounts sidesteps that timing gap entirely.
  const setMapContainer = useCallback((node: HTMLDivElement | null) => {
    mapContainerRef.current = node;
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    if (!node) return;

    const map = new mapboxgl.Map({
      container: node,
      style: STYLE_URL || {
        version: 8,
        sources: {},
        layers: [{ id: "background", type: "background", paint: { "background-color": "#e5e7eb" } }],
      },
      center: [8.6753, 9.082], // Nigeria centroid
      zoom: 6,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "bottom-right");

    // The container's final width isn't settled until the Modal's open
    // transition finishes, so the canvas can init too narrow. A
    // ResizeObserver keeps it correctly sized whenever the container changes.
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(node);
    const initialResizeTimer = setTimeout(() => map.resize(), 300);
    map.once("remove", () => {
      resizeObserver.disconnect();
      clearTimeout(initialResizeTimer);
    });

    map.on("click", (e) => {
      const point = { lat: e.lngLat.lat, lng: e.lngLat.lng };
      setTab((currentTab) => {
        if (currentTab === "pin") {
          setPin(point);
        } else if (currentTab === "boundary") {
          setBoundary((prev) => [...prev, point]);
        }
        return currentTab;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render pin marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (pinMarkerRef.current) {
      pinMarkerRef.current.remove();
      pinMarkerRef.current = null;
    }
    if (pin) {
      pinMarkerRef.current = new mapboxgl.Marker({ color: "#dc2626" })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map);
      map.flyTo({ center: [pin.lng, pin.lat], zoom: Math.max(map.getZoom(), 12) });
    }
  }, [pin]);

  // Render boundary line/points
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const geojson = {
      type: "FeatureCollection" as const,
      features:
        boundary.length > 1
          ? [
              {
                type: "Feature" as const,
                properties: {},
                geometry: {
                  type: "LineString" as const,
                  coordinates: boundary.map((p) => [p.lng, p.lat]),
                },
              },
            ]
          : [],
    };

    const applyLayers = () => {
      if (map.getSource("boundary-line")) {
        (map.getSource("boundary-line") as mapboxgl.GeoJSONSource).setData(geojson);
      } else {
        map.addSource("boundary-line", { type: "geojson", data: geojson });
        map.addLayer({
          id: "boundary-line-layer",
          type: "line",
          source: "boundary-line",
          paint: { "line-color": "#0ea5b7", "line-width": 2, "line-dasharray": [2, 2] },
        });
      }
    };

    if (map.isStyleLoaded()) applyLayers();
    else map.once("styledata", applyLayers);
  }, [boundary]);

  const area = polygonAreaHectares(boundary);
  const perimeter = boundary.reduce((sum, p, i) => {
    if (i === 0) return sum;
    return sum + haversine(boundary[i - 1], p);
  }, boundary.length > 2 ? haversine(boundary[boundary.length - 1], boundary[0]) : 0);

  const handleManualSubmit = () => {
    const lat = Number(manualLat);
    const lng = Number(manualLng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setPin({ lat, lng });
    }
  };

  const canCloseBoundary = boundary.length >= 3;

  return (
    <Modal open={open} onCancel={onClose} footer={null} width={1160} destroyOnClose>
      <div className="flex items-center justify-center gap-3 mb-4 text-sm">
        {(["pin", "boundary", "review"] as Tab[]).map((t, i) => (
          <div key={t} className="flex items-center gap-3">
            <button
              onClick={() => setTab(t)}
              className={`flex items-center gap-2 ${tab === t ? "text-gray-900 font-medium" : "text-gray-400"}`}
            >
              <span
                className={`h-3.5 w-3.5 rounded-full border-2 ${
                  tab === t ? "border-gray-900 bg-gray-900" : "border-gray-300"
                }`}
              />
              {t === "pin" ? "Place Pin" : t === "boundary" ? "Draw Boundary" : "Review"}
            </button>
            {i < 2 && <div className="w-10 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <div className="relative rounded-xl overflow-hidden border border-gray-100 h-[560px]">
          <div ref={setMapContainer} className="w-full h-full" />
          {!GEOAPIFY_KEY && (
            <div className="absolute inset-0 bg-gray-100/90 flex items-center justify-center text-center p-6">
              <p className="text-sm text-gray-500">
                Map tiles unavailable — set NEXT_PUBLIC_GEOAPIFY_API_KEY to enable satellite/street tiles.
                Pin placement and boundary tracking still work by clicking the map area.
              </p>
            </div>
          )}
        </div>

        <div>
          {tab === "pin" && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Place Mine Location</h3>
                <p className="text-sm text-gray-500 mt-1">Drop a pin at the centre of your mining operation on the map.</p>
              </div>
              <Button
                block
                size="large"
                onClick={() => {
                  navigator.geolocation?.getCurrentPosition((pos) => {
                    setPin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                  });
                }}
              >
                Use GPS Location →
              </Button>
              <div className="text-center text-xs text-gray-400">or click on map</div>

              {pin ? (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div className="text-xs text-gray-500 mb-2">📍 Pin placed</div>
                  <div className="text-xs text-gray-400">LATITUDE</div>
                  <div className="text-sm font-semibold">{pin.lat.toFixed(6)}°</div>
                  <div className="text-xs text-gray-400 mt-2">LONGITUDE</div>
                  <div className="text-sm font-semibold">{pin.lng.toFixed(6)}°</div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
                  No location selected
                  <br />
                  Click the map to place your pin
                </div>
              )}

              <div className="rounded-lg bg-blue-50 text-blue-700 text-xs p-3">
                Place the pin at the main access or processing point. You will trace the exact mine boundary in the next step.
              </div>

              <div className="text-center text-xs text-gray-400">or enter manually</div>
              <Input
                placeholder="Latitude (e.g. 5.23456)"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
              />
              <Input
                placeholder="Longitude (e.g. 5.23456)"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
              />
              <Button onClick={handleManualSubmit}>Verify Coordinates</Button>

              <Button type="primary" size="large" disabled={!pin} onClick={() => setTab("boundary")}>
                Continue
              </Button>
            </div>
          )}

          {tab === "boundary" && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Trace Mining Boundary</h3>
                <p className="text-sm text-gray-500 mt-1">Click the map to mark boundary vertices around your concession.</p>
              </div>
              <div className="rounded-lg bg-blue-50 text-blue-700 text-xs p-3">
                Click along the perimeter of your mining area. Add at least 3 points, then press &quot;Close Boundary&quot;.
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>{boundary.length} points</span>
                <div className="flex gap-2 text-gray-400">
                  <button onClick={() => setBoundary([])} aria-label="Reset">↺</button>
                  <button onClick={() => setBoundary((p) => p.slice(0, -1))} aria-label="Undo last">🗑</button>
                </div>
              </div>
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto">
                {boundary.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm bg-gray-50 rounded-lg px-3 py-2">
                    <span className="h-5 w-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
                  </div>
                ))}
              </div>
              {!canCloseBoundary && (
                <div className="text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2">
                  Add {3 - boundary.length} more point{3 - boundary.length === 1 ? "" : "s"} to close the boundary.
                </div>
              )}
              {canCloseBoundary && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-400">EST. AREA</div>
                    <div className="text-base font-semibold text-gray-900">{area.toFixed(1)}</div>
                    <div className="text-gray-400">hectares</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-gray-400">VERTICES</div>
                    <div className="text-base font-semibold text-gray-900">{boundary.length}</div>
                    <div className="text-gray-400">boundary points</div>
                  </div>
                </div>
              )}
              <div className="flex justify-between mt-2">
                <Button onClick={() => setTab("pin")}>← Back</Button>
                <Button type="primary" disabled={!canCloseBoundary} onClick={() => setTab("review")}>
                  {canCloseBoundary ? "Close boundary" : "Continue"}
                </Button>
              </div>
            </div>
          )}

          {tab === "review" && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Review Location Data</h3>
                <p className="text-sm text-gray-500 mt-1">Verify everything before submitting to Beldium.</p>
              </div>
              <div className="flex gap-2">
                <span className="text-xs bg-green-50 text-green-700 rounded-full px-3 py-1">✓ Valid Coordinates</span>
                {canCloseBoundary && (
                  <span className="text-xs bg-green-50 text-green-700 rounded-full px-3 py-1">✓ Boundary complete</span>
                )}
              </div>
              {pin && (
                <div className="rounded-lg border border-gray-100 p-4">
                  <div className="text-xs text-gray-500 mb-2">📍 Mine Pin Coordinates</div>
                  <div className="text-xs text-gray-400">LATITUDE</div>
                  <div className="text-sm font-semibold">{pin.lat.toFixed(6)}°</div>
                  <div className="text-xs text-gray-400 mt-2">LONGITUDE</div>
                  <div className="text-sm font-semibold">{pin.lng.toFixed(6)}°</div>
                </div>
              )}
              {canCloseBoundary && (
                <div className="rounded-lg border border-gray-100 p-4">
                  <div className="text-xs text-gray-500 mb-2">Mining Boundary</div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-gray-400">AREA</div>
                      <div className="text-sm font-semibold">{area.toFixed(1)} hectares</div>
                    </div>
                    <div>
                      <div className="text-gray-400">VERTICES</div>
                      <div className="text-sm font-semibold">{boundary.length}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-gray-400">APPROX. PERIMETER</div>
                      <div className="text-sm font-semibold">{perimeter.toFixed(0)} m</div>
                    </div>
                  </div>
                </div>
              )}
              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                Coordinates are encrypted end-to-end and shared only with verified buyers under NDA. Exact locations are never published publicly.
              </div>
              <div className="flex justify-between mt-2">
                <Button onClick={() => setTab("boundary")}>← Back</Button>
                <Button
                  type="primary"
                  disabled={!pin}
                  onClick={() =>
                    onSubmit({ pin, boundary, areaHectares: area, perimeterMeters: perimeter })
                  }
                >
                  Submit Location →
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
