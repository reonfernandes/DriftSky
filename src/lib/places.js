const MAX_RECENT = 6;

/** Two places are the same if their coordinates are within roughly 5 km of each other. */
export function samePlace(a, b) {
    return Math.abs(a.lat - b.lat) < 0.05 && Math.abs(a.lon - b.lon) < 0.05;
}

/**
 * Adds a place to the recent list. A new place goes to the front; a place already in the
 * list keeps its position, so chips don't jump around when you click between them.
 */
export function addRecentPlace(list, place) {
    if (list.some((p) => samePlace(p, place))) {
        return list.map((p) => (samePlace(p, place) ? place : p));
    }
    return [place, ...list].slice(0, MAX_RECENT);
}

/** A few well-known cities offered before the user has searched for anything. */
export const STARTER_PLACES = [
    { name: "London", state: "England", country: "GB", lat: 51.5073, lon: -0.1276 },
    { name: "Tokyo", state: "", country: "JP", lat: 35.6828, lon: 139.759 },
    { name: "New York", state: "New York", country: "US", lat: 40.7128, lon: -74.006 },
    { name: "Mumbai", state: "Maharashtra", country: "IN", lat: 19.0761, lon: 72.8775 },
    { name: "Reykjavík", state: "", country: "IS", lat: 64.1466, lon: -21.9426 },
];
