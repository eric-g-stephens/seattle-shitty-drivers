export type LatLng = { lat: number; lng: number };

// Approx conversions; good enough at city scale.
const METERS_PER_DEGREE_LAT = 111_320;

function metersToDegreesLat(meters: number): number {
  return meters / METERS_PER_DEGREE_LAT;
}

function metersToDegreesLng(meters: number, atLatDegrees: number): number {
  const latRad = (atLatDegrees * Math.PI) / 180;
  const metersPerDegreeLng = METERS_PER_DEGREE_LAT * Math.cos(latRad);
  return metersPerDegreeLng === 0 ? 0 : meters / metersPerDegreeLng;
}

/**
 * Adds a random offset within a circle (uniform area distribution).
 * Intended for privacy: makes stored coordinates imprecise.
 */
export function jitterLatLng(
  lat: number,
  lng: number,
  opts: { maxMeters: number; rng?: () => number }
): LatLng {
  const rng = opts.rng ?? Math.random;

  // Uniform over circle area: r = sqrt(u) * R
  const u = rng();
  const rMeters = Math.sqrt(u) * opts.maxMeters;
  const theta = rng() * 2 * Math.PI;

  const dNorth = rMeters * Math.cos(theta);
  const dEast = rMeters * Math.sin(theta);

  const dLat = metersToDegreesLat(dNorth);
  const dLng = metersToDegreesLng(dEast, lat);

  return { lat: lat + dLat, lng: lng + dLng };
}

