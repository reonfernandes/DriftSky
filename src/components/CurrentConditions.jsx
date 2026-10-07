import { capitalize, formatDate, formatTime, temperature, Units } from "../lib/format";
import { WeatherIcon } from "./Icon";

export default function CurrentConditions({ weather, units, now }) {
    const { place, timezone, today } = weather;
    const t = (celsius) => temperature(celsius, units);

    return (
        <section className="current" aria-label={`Current weather in ${place.name}`}>
            <h1 className="current__place">
                {place.name}
                {place.country && <span>, {place.country}</span>}
            </h1>
            <p className="current__meta">
                {place.state && <>{place.state} · </>}
                {formatDate(now, timezone)} · {formatTime(now, timezone)} local time
            </p>

            <div className="current__now">
                <WeatherIcon name={weather.icon} className="current__icon" />
                <p className="current__temp">
                    {t(weather.temp)}
                    <sup>{units === Units.IMPERIAL ? "°F" : "°C"}</sup>
                </p>
            </div>

            <p className="current__condition">
                {capitalize(weather.description)} · Feels like {t(weather.feelsLike)}°
            </p>
            {today && (
                <p className="current__range">
                    <span>H {t(today.max)}°</span>
                    <span>L {t(today.min)}°</span>
                </p>
            )}
        </section>
    );
}
