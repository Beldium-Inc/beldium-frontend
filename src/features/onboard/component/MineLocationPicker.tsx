"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Button, Input } from "antd";
import {
  AimOutlined,
  CheckCircleFilled,
  EnvironmentOutlined,
  LoadingOutlined,
  UndoOutlined,
  DeleteOutlined,
  WarningFilled,
} from "@ant-design/icons";
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

const STEPS: { key: Tab; label: string }[] = [
  { key: "pin", label: "Place Pin" },
  { key: "boundary", label: "Draw Boundary" },
  { key: "review", label: "Review" },
];

// The backend stores coordinates as DECIMAL(9,6) - 3 digits before the point,
// 6 after. Raw map clicks / GPS reads come back with far more precision than
// that, so every point needs rounding at the moment it enters state, not just
// at display time, or the save request 400s on "no more than 9 digits".
function round6(n: number) {
  return Math.round(n * 1e6) / 1e6;
}

function roundPoint(p: { lat: number; lng: number }) {
  return { lat: round6(p.lat), lng: round6(p.lng) };
}

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
  onSubmit: (result: MineLocationResult) => void | Promise<void>;
  initial?: MineLocationResult | null;
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const pinMarkerRef = useRef<Marker | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef<Tab>("pin");

  const [tab, setTab] = useState<Tab>("pin");
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(initial?.pin || null);
  const [boundary, setBoundary] = useState<{ lat: number; lng: number }[]>(initial?.boundary || []);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset transient state each time the modal is (re)opened, so a previous
  // save error or in-flight spinner doesn't linger across sessions.
  useEffect(() => {
    if (open) {
      setPin(initial?.pin || null);
      setBoundary(initial?.boundary || []);
      setTab("pin");
      setSubmitError(null);
      setSubmitting(false);
      setLocateError(null);
      setLocating(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // The side panel is a persisted scrollable node across tab switches - React
  // doesn't reset its scroll position on its own, so without this, switching
  // from a taller tab (e.g. a long boundary point list) to a shorter one
  // (Review) leaves the panel scrolled down, showing blank space above a
  // half-visible heading.
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  useEffect(() => {
    tabRef.current = tab;
  }, [tab]);

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
      const point = roundPoint({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      // Read the current tab from a ref, not a `setTab(current => ...)` side
      // channel: that pattern ran setPin/setBoundary as a side effect inside
      // a state *updater*, which React 18 Strict Mode deliberately invokes
      // twice in development to catch exactly this kind of impurity - the
      // visible symptom was every boundary click registering two points.
      if (tabRef.current === "pin") {
        setPin(point);
      } else if (tabRef.current === "boundary") {
        setBoundary((prev) => [...prev, point]);
      }
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
      pinMarkerRef.current = new mapboxgl.Marker({ color: "#DC2626" })
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
          paint: { "line-color": "#2563EB", "line-width": 3, "line-dasharray": [2, 2] },
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
      setPin(roundPoint({ lat, lng }));
      setManualLat("");
      setManualLng("");
    }
  };

  const DENIED_HELP =
    "Location access was denied. Once a site is blocked, the browser won't show the permission prompt " +
    "again on request - reset it yourself: click the lock/site-info icon next to the address bar → " +
    "Permissions (or Site settings) → Location → Allow, then reload this page. If this map is embedded " +
    "inside another page/frame, GPS may be blocked entirely for that embed - open the site directly in " +
    "its own tab instead.";

  const handleUseGps = async () => {
    setLocateError(null);
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocateError("GPS isn't available in this browser. Place the pin manually or enter coordinates below.");
      return;
    }
    if (window.isSecureContext === false) {
      setLocateError("GPS location requires a secure (https) connection. Place the pin manually instead.");
      return;
    }

    // Check permission state up front: once it's "denied", calling
    // getCurrentPosition again will NOT re-show the browser's allow/deny
    // prompt (browsers do this deliberately, to stop sites from nagging) -
    // so detect that case and go straight to the reset instructions instead
    // of making the user click the button just to see the same dead end.
    if (navigator.permissions?.query) {
      try {
        const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
        if (status.state === "denied") {
          setLocateError(DENIED_HELP);
          return;
        }
      } catch {
        // Permissions API not supported for this query in this browser - fall through and just try.
      }
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPin(roundPoint({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocateError(DENIED_HELP);
        } else if (err.code === err.TIMEOUT) {
          setLocateError("Timed out getting your location. Try again, or place the pin manually.");
        } else {
          setLocateError("Couldn't get your location. Place the pin manually or enter coordinates below.");
        }
      },
      { timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async () => {
    if (!pin || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit({ pin: roundPoint(pin), boundary: boundary.map(roundPoint), areaHectares: area, perimeterMeters: perimeter });
    } catch (error: unknown) {
      const e = error as { response?: { data?: { message?: string } }; message?: string };
      setSubmitError(
        e?.response?.data?.message || e?.message || "Couldn't save this location. Check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canCloseBoundary = boundary.length >= 3;

  return (
    <Modal
      open={open}
      onCancel={submitting ? undefined : onClose}
      closable={!submitting}
      maskClosable={!submitting}
      footer={null}
      width={1160}
      destroyOnClose
      styles={{ container: { borderRadius: 20, padding: 0, overflow: "hidden" } }}
    >
      <div className="px-8 pt-6 pb-1">
        <h2 className="text-lg font-semibold text-gray-900">Mine Location</h2>
        <p className="text-sm text-gray-500 mt-0.5">Pinpoint your site and (optionally) trace its boundary.</p>
      </div>

      <div className="flex items-center justify-center gap-3 py-5 text-sm border-b border-gray-100 bg-white">
        {STEPS.map((step, i) => {
          const isActive = tab === step.key;
          const isDone = STEPS.findIndex((s) => s.key === tab) > i;
          return (
            <div key={step.key} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => !submitting && setTab(step.key)}
                disabled={submitting}
                className={`flex items-center gap-2 transition-colors ${
                  isActive ? "text-[#101E3D] font-semibold" : isDone ? "text-[#2563EB]" : "text-gray-400"
                }`}
              >
                {isDone ? (
                  <CheckCircleFilled className="text-[#2563EB]" />
                ) : (
                  <span
                    className={`h-3.5 w-3.5 rounded-full border-2 ${
                      isActive ? "border-[#101E3D] bg-[#101E3D]" : "border-gray-300"
                    }`}
                  />
                )}
                {step.label}
              </button>
              {i < STEPS.length - 1 && <div className="w-10 h-px bg-gray-200" />}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-0">
        <div className="relative overflow-hidden h-[280px] lg:h-[640px] bg-gray-100">
          <div ref={setMapContainer} className="w-full h-full" />
          {!GEOAPIFY_KEY && (
            <div className="absolute inset-0 bg-gray-100/95 flex items-center justify-center text-center p-6">
              <p className="text-sm text-gray-500">
                Map tiles unavailable - set NEXT_PUBLIC_GEOAPIFY_API_KEY to enable satellite/street tiles.
                Pin placement and boundary tracking still work by clicking the map area.
              </p>
            </div>
          )}
        </div>

        <div ref={panelRef} className="p-6 lg:p-7 bg-white overflow-y-auto max-h-[280px] lg:max-h-[640px]">
          {tab === "pin" && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Place Mine Location</h3>
                <p className="text-sm text-gray-500 mt-1">Drop a pin at the centre of your mining operation on the map.</p>
              </div>
              <Button
                block
                size="large"
                icon={locating ? <LoadingOutlined /> : <AimOutlined />}
                onClick={handleUseGps}
                disabled={locating}
              >
                {locating ? "Locating…" : "Use GPS Location"}
              </Button>
              {locateError && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 text-red-700 text-xs p-3">
                  <WarningFilled className="mt-0.5" />
                  <span>{locateError}</span>
                </div>
              )}
              <div className="text-center text-xs text-gray-400">or click on map</div>

              {pin ? (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                    <EnvironmentOutlined className="text-red-500" /> Pin placed
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-400">LATITUDE</div>
                      <div className="text-sm font-semibold text-gray-900">{pin.lat.toFixed(6)}°</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">LONGITUDE</div>
                      <div className="text-sm font-semibold text-gray-900">{pin.lng.toFixed(6)}°</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
                  No location selected
                  <br />
                  Click the map to place your pin
                </div>
              )}

              <div className="rounded-xl bg-blue-50 text-blue-700 text-xs p-3">
                Place the pin at the main access or processing point. You can trace the exact mine boundary in the next step, or skip straight to review.
              </div>

              <div className="text-center text-xs text-gray-400 mt-1">or enter manually</div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Latitude"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                />
                <Input
                  placeholder="Longitude"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                />
              </div>
              <Button onClick={handleManualSubmit} disabled={!manualLat || !manualLng}>
                Use these coordinates
              </Button>

              <div className="flex gap-3 mt-2">
                <Button size="large" className="flex-1" disabled={!pin} onClick={() => setTab("review")}>
                  Skip boundary
                </Button>
                <Button type="primary" size="large" className="flex-1" disabled={!pin} onClick={() => setTab("boundary")}>
                  Trace boundary →
                </Button>
              </div>
            </div>
          )}

          {tab === "boundary" && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Trace Mining Boundary</h3>
                <p className="text-sm text-gray-500 mt-1">Click the map to mark boundary vertices around your concession.</p>
              </div>
              <div className="rounded-xl bg-blue-50 text-blue-700 text-xs p-3">
                Click along the perimeter of your mining area. Add at least 3 points, then close the boundary.
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{boundary.length} point{boundary.length === 1 ? "" : "s"}</span>
                <div className="flex gap-1">
                  <Button size="small" type="text" icon={<UndoOutlined />} onClick={() => setBoundary([])}>
                    Reset
                  </Button>
                  <Button
                    size="small"
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => setBoundary((p) => p.slice(0, -1))}
                    disabled={boundary.length === 0}
                  >
                    Undo
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {boundary.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm bg-gray-50 rounded-lg px-3 py-2">
                    <span className="h-5 w-5 rounded-full bg-[#101E3D] text-white text-xs flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-gray-700">{p.lat.toFixed(5)}, {p.lng.toFixed(5)}</span>
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
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-gray-400">EST. AREA</div>
                    <div className="text-base font-semibold text-gray-900">{area.toFixed(1)}</div>
                    <div className="text-gray-400">hectares</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="text-gray-400">VERTICES</div>
                    <div className="text-base font-semibold text-gray-900">{boundary.length}</div>
                    <div className="text-gray-400">boundary points</div>
                  </div>
                </div>
              )}
              <div className="flex justify-between mt-2">
                <Button onClick={() => setTab("pin")}>← Back</Button>
                <Button type="primary" disabled={!canCloseBoundary} onClick={() => setTab("review")}>
                  {canCloseBoundary ? "Close boundary" : "Add points to continue"}
                </Button>
              </div>
            </div>
          )}

          {tab === "review" && (
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Review Location Data</h3>
                <p className="text-sm text-gray-500 mt-1">Verify everything before saving to Beldium.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 rounded-full px-3 py-1">
                  <CheckCircleFilled /> Valid Coordinates
                </span>
                {canCloseBoundary && (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 rounded-full px-3 py-1">
                    <CheckCircleFilled /> Boundary complete
                  </span>
                )}
              </div>
              {pin && (
                <div className="rounded-xl border border-gray-100 p-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                    <EnvironmentOutlined className="text-red-500" /> Mine Pin Coordinates
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-400">LATITUDE</div>
                      <div className="text-sm font-semibold text-gray-900">{pin.lat.toFixed(6)}°</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">LONGITUDE</div>
                      <div className="text-sm font-semibold text-gray-900">{pin.lng.toFixed(6)}°</div>
                    </div>
                  </div>
                </div>
              )}
              {canCloseBoundary && (
                <div className="rounded-xl border border-gray-100 p-4">
                  <div className="text-xs text-gray-500 mb-2">Mining Boundary</div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-gray-400">AREA</div>
                      <div className="text-sm font-semibold text-gray-900">{area.toFixed(1)} hectares</div>
                    </div>
                    <div>
                      <div className="text-gray-400">VERTICES</div>
                      <div className="text-sm font-semibold text-gray-900">{boundary.length}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-gray-400">APPROX. PERIMETER</div>
                      <div className="text-sm font-semibold text-gray-900">{perimeter.toFixed(0)} m</div>
                    </div>
                  </div>
                </div>
              )}
              <div className="text-xs text-gray-500 bg-gray-50 rounded-xl p-3">
                Coordinates are encrypted end-to-end and shared only with verified buyers under NDA. Exact locations are never published publicly.
              </div>

              {submitError && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 text-red-700 text-xs p-3">
                  <WarningFilled className="mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="flex justify-between mt-2">
                <Button onClick={() => setTab("boundary")} disabled={submitting}>
                  ← Back
                </Button>
                <Button
                  type="primary"
                  disabled={!pin}
                  loading={submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? "Saving…" : "Submit Location →"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
