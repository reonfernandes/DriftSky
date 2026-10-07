import { UiIcon } from "./Icon";

function updatedLabel(fetchedAt, now) {
    const minutes = Math.floor((now * 1000 - fetchedAt) / 60_000);
    if (minutes < 1) return "Updated just now";
    if (minutes === 1) return "Updated 1 minute ago";
    return `Updated ${minutes} minutes ago`;
}

export default function Footer({ fetchedAt, now, onRefresh, refreshing }) {
    return (
        <footer className="footer">
            <p className="footer__data">
                Weather data from{" "}
                <a href="https://openweathermap.org/" target="_blank" rel="noopener noreferrer">
                    OpenWeather
                </a>
                {fetchedAt && (
                    <>
                        {" · "}
                        {updatedLabel(fetchedAt, now)}
                        <button
                            type="button"
                            className="footer__refresh"
                            onClick={onRefresh}
                            disabled={refreshing}
                            aria-label="Refresh weather"
                            title="Refresh weather"
                        >
                            <UiIcon name="refresh" />
                        </button>
                    </>
                )}
            </p>
            <p>
                © {new Date().getFullYear()} Reon Fernandes ·{" "}
                <a href="https://github.com/reonfernandes/DriftSky" target="_blank" rel="noopener noreferrer">
                    GitHub
                </a>
            </p>
        </footer>
    );
}
