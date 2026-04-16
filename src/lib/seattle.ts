const SEATTLE_BOUNDS = {
  minLat: 47.40,
  maxLat: 47.80,
  minLng: -122.50,
  maxLng: -122.20,
};

export function isInSeattle(lat: number, lng: number): boolean {
  return (
    lat >= SEATTLE_BOUNDS.minLat &&
    lat <= SEATTLE_BOUNDS.maxLat &&
    lng >= SEATTLE_BOUNDS.minLng &&
    lng <= SEATTLE_BOUNDS.maxLng
  );
}
