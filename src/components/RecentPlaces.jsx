import { samePlace } from "../lib/places";

export default function RecentPlaces({ places, current, onSelect }) {
    if (!places.length) return null;

    return (
        <nav className="recent" aria-label="Recent cities">
            <span className="recent__label">Recent</span>
            {places.map((place) => (
                <button
                    key={`${place.lat},${place.lon}`}
                    type="button"
                    className="chip"
                    aria-pressed={Boolean(current && samePlace(place, current))}
                    onClick={() => onSelect(place)}
                    title={[place.name, place.state, place.country].filter(Boolean).join(", ")}
                >
                    {place.name}
                </button>
            ))}
        </nav>
    );
}
