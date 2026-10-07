import { ErrorCode } from "../api/openWeather";

function describe(error) {
    switch (error.code) {
        case ErrorCode.MISSING_KEY:
            return {
                title: "Add your OpenWeather API key",
                body: "Copy .env.example to .env, paste your key after VITE_WEATHER_API_KEY=, then restart the dev server.",
                retry: false,
            };
        case ErrorCode.INVALID_KEY:
            return {
                title: "OpenWeather didn't accept the API key",
                body: "Check VITE_WEATHER_API_KEY in your .env file. New keys can take up to 2 hours to start working.",
                retry: true,
            };
        case ErrorCode.NOT_FOUND:
            return {
                title: error.details.query ? `No city called “${error.details.query}”` : "No weather for this place",
                body: "Check the spelling, or add a country code to narrow it down, for example “Paris, FR”.",
                retry: false,
            };
        case ErrorCode.RATE_LIMITED:
            return {
                title: "Too many requests right now",
                body: "The free OpenWeather plan allows 60 requests a minute. Wait a moment, then try again.",
                retry: true,
            };
        case ErrorCode.OFFLINE:
            return {
                title: "Can't reach OpenWeather",
                body: "Check your internet connection, then try again.",
                retry: true,
            };
        case ErrorCode.LOCATION_DENIED:
            return {
                title: "Location access is blocked",
                body: "Allow location for this site in your browser settings, or search for a city instead.",
                retry: false,
            };
        case ErrorCode.LOCATION_UNAVAILABLE:
            return {
                title: "Couldn't find your location",
                body: "Your device didn't share a position. Try again, or search for a city instead.",
                retry: true,
            };
        default:
            return {
                title: "Something went wrong",
                body: "OpenWeather sent an unexpected response. Try again in a moment.",
                retry: true,
            };
    }
}

export default function ErrorState({ error, previousPlace, onRetry, onDismiss }) {
    const { title, body, retry } = describe(error);

    return (
        <section className="panel state" role="alert">
            <h2 className="state__title">{title}</h2>
            <p className="state__body">{body}</p>
            <div className="state__actions">
                {retry && (
                    <button type="button" className="button button--solid" onClick={onRetry}>
                        Try again
                    </button>
                )}
                {previousPlace && (
                    <button type="button" className={retry ? "button" : "button button--solid"} onClick={onDismiss}>
                        Back to {previousPlace.name}
                    </button>
                )}
            </div>
        </section>
    );
}
