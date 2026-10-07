import { STARTER_PLACES } from "../lib/places";
import { UiIcon } from "./Icon";

/** First-visit screen, before any city has been searched. */
export default function Welcome({ onSelect, onLocate }) {
    return (
        <section className="panel state state--welcome">
            <h1 className="state__title">Where should we look?</h1>
            <p className="state__body">
                Search for any city above, or use your location. DriftSky shows the sky there right now, the next 24
                hours and the next 5 days.
            </p>
            <div className="state__actions">
                <button type="button" className="button button--solid" onClick={onLocate}>
                    <UiIcon name="pin" />
                    Use my location
                </button>
            </div>
            <div className="state__starters">
                <span className="recent__label">Or try</span>
                {STARTER_PLACES.map((place) => (
                    <button key={place.name} type="button" className="chip" onClick={() => onSelect(place)}>
                        {place.name}
                    </button>
                ))}
            </div>
        </section>
    );
}
