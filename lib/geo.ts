// Radius UI is in miles; the nearby_deals() RPC takes meters.
export const MILES_TO_METERS = 1609.344;

export const milesToMeters = (miles: number): number =>
  miles * MILES_TO_METERS;

export const metersToMiles = (meters: number): number =>
  meters / MILES_TO_METERS;

// deal_details() returns no distance (no user location server-side); the
// detail screen computes it client-side from the store store_lat/lng + the
// device coords. Great-circle distance, good enough at city scale.
export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6_371_000; // earth radius, meters
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function formatDistanceMiles(
  meters: number | null | undefined,
): string {
  if (meters == null) return '';
  const miles = metersToMiles(meters);
  if (miles < 0.1) return '<0.1 mi';
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}
