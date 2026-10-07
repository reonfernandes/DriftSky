import { formatHour, temperature } from "../lib/format";
import { WeatherIcon } from "./Icon";

const SHOW_RAIN_FROM = 20;

export default function HourlyForecast({ weather, units }) {
    const t = (celsius) => temperature(celsius, units);

    return (
        <section className="panel hourly" aria-labelledby="hourly-title">
            <h2 className="panel__title" id="hourly-title">
                Next 24 hours
            </h2>
            <ol className="hourly__list">
                <li className="hourly__slot is-now">
                    <span className="hourly__time">Now</span>
                    <WeatherIcon name={weather.icon} />
                    <span className="hourly__temp">{t(weather.temp)}°</span>
                    <span className="hourly__rain" />
                </li>
                {weather.hourly.map((slot) => (
                    <li key={slot.dt} className="hourly__slot">
                        <span className="hourly__time">{formatHour(slot.dt, weather.timezone)}</span>
                        <WeatherIcon name={slot.icon} />
                        <span className="hourly__temp">{t(slot.temp)}°</span>
                        <span className="hourly__rain">
                            {slot.pop >= SHOW_RAIN_FROM && (
                                <>
                                    {slot.pop}%<span className="visually-hidden"> chance of rain</span>
                                </>
                            )}
                        </span>
                    </li>
                ))}
            </ol>
        </section>
    );
}
