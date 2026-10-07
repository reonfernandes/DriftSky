export const Units = {
    METRIC: "metric",
    IMPERIAL: "imperial",
};

/** Rounds a Celsius value, converting to Fahrenheit first when imperial units are selected. */
export function temperature(celsius, units) {
    const value = units === Units.IMPERIAL ? (celsius * 9) / 5 + 32 : celsius;
    // `|| 0` turns -0 into 0 so the UI never shows "-0°".
    return Math.round(value) || 0;
}

/** Converts metres per second to km/h or mph. */
export function windSpeed(metersPerSecond, units) {
    if (units === Units.IMPERIAL) return { value: Math.round(metersPerSecond * 2.23694), unit: "mph" };
    return { value: Math.round(metersPerSecond * 3.6), unit: "km/h" };
}

/** Converts metres to km or miles with one decimal place. */
export function distance(meters, units) {
    if (units === Units.IMPERIAL) return { value: (meters / 1609.344).toFixed(1), unit: "mi" };
    return { value: (meters / 1000).toFixed(1), unit: "km" };
}

/**
 * OpenWeather gives timestamps in UTC plus the location's offset from UTC in seconds.
 * Shifting the timestamp by the offset and formatting it as UTC yields the location's wall-clock time,
 * whatever timezone the viewer's computer is in.
 */
function formatInZone(unixSeconds, offsetSeconds, locale, options) {
    const shifted = new Date((unixSeconds + offsetSeconds) * 1000);
    return new Intl.DateTimeFormat(locale, { ...options, timeZone: "UTC" }).format(shifted);
}

export function formatTime(unixSeconds, offsetSeconds, locale) {
    return formatInZone(unixSeconds, offsetSeconds, locale, { hour: "numeric", minute: "2-digit" });
}

export function formatHour(unixSeconds, offsetSeconds, locale) {
    return formatInZone(unixSeconds, offsetSeconds, locale, { hour: "numeric" });
}

export function formatWeekday(unixSeconds, offsetSeconds, locale) {
    return formatInZone(unixSeconds, offsetSeconds, locale, { weekday: "short" });
}

export function formatDate(unixSeconds, offsetSeconds, locale) {
    return formatInZone(unixSeconds, offsetSeconds, locale, { weekday: "short", day: "numeric", month: "short" });
}

/** Calendar date at the location, as "YYYY-MM-DD". Used to group forecast entries by day. */
export function localDateKey(unixSeconds, offsetSeconds) {
    return new Date((unixSeconds + offsetSeconds) * 1000).toISOString().slice(0, 10);
}

/** 42_960 seconds -> "11h 56m". */
export function formatDuration(seconds) {
    const totalMinutes = Math.max(0, Math.round(seconds / 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (!hours) return `${minutes}m`;
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
}

const COMPASS_POINTS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

/** Wind direction in degrees -> 16-point compass name. */
export function compassPoint(degrees) {
    const normalized = ((degrees % 360) + 360) % 360;
    return COMPASS_POINTS[Math.round(normalized / 22.5) % 16];
}

/** Dew point in Celsius using the Magnus formula. */
export function dewPoint(celsius, humidity) {
    const a = 17.62;
    const b = 243.12;
    const gamma = Math.log(Math.max(humidity, 1) / 100) + (a * celsius) / (b + celsius);
    return (b * gamma) / (a - gamma);
}

export function pressureLabel(hPa) {
    if (hPa < 1009) return "Low, unsettled";
    if (hPa > 1020) return "High, settled";
    return "Normal";
}

export function visibilityLabel(meters) {
    if (meters >= 10000) return "Clear view";
    if (meters >= 5000) return "Good";
    if (meters >= 1000) return "Hazy";
    return "Poor";
}

export function capitalize(text) {
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}
