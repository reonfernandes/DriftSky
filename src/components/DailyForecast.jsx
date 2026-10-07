import { formatWeekday, temperature } from "../lib/format";
import { WeatherIcon } from "./Icon";

const SHOW_RAIN_FROM = 20;

export default function DailyForecast({ weather, units }) {
    const { daily, timezone } = weather;
    const t = (celsius) => temperature(celsius, units);

    // All bars share one scale, so a warmer day sits further right.
    const lowest = Math.min(...daily.map((d) => d.min));
    const highest = Math.max(...daily.map((d) => d.max));
    const span = highest - lowest || 1;

    return (
        <section className="panel daily" aria-labelledby="daily-title">
            <h2 className="panel__title" id="daily-title">
                {daily.length}-day forecast
            </h2>
            <ol className="daily__list">
                {daily.map((day) => (
                    <li key={day.key} className="daily__row">
                        <span className="daily__day">{day.isToday ? "Today" : formatWeekday(day.dt, timezone)}</span>
                        <WeatherIcon name={day.icon} />
                        <span className="daily__rain">
                            {day.pop >= SHOW_RAIN_FROM && (
                                <>
                                    {day.pop}%<span className="visually-hidden"> chance of rain</span>
                                </>
                            )}
                        </span>
                        <span className="daily__low">
                            <span className="visually-hidden">Low </span>
                            {t(day.min)}°
                        </span>
                        <span className="daily__range" aria-hidden="true">
                            <i
                                style={{
                                    left: `${((day.min - lowest) / span) * 100}%`,
                                    width: `${((day.max - day.min) / span) * 100}%`,
                                }}
                            />
                        </span>
                        <span className="daily__high">
                            <span className="visually-hidden">High </span>
                            {t(day.max)}°
                        </span>
                    </li>
                ))}
            </ol>
        </section>
    );
}
