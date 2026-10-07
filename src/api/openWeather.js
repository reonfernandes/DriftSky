const API_ROOT = "https://api.openweathermap.org";

export const ErrorCode = {
    MISSING_KEY: "MISSING_KEY",
    INVALID_KEY: "INVALID_KEY",
    NOT_FOUND: "NOT_FOUND",
    RATE_LIMITED: "RATE_LIMITED",
    OFFLINE: "OFFLINE",
    LOCATION_DENIED: "LOCATION_DENIED",
    LOCATION_UNAVAILABLE: "LOCATION_UNAVAILABLE",
    UNKNOWN: "UNKNOWN",
};

export class WeatherError extends Error {
    constructor(code, message, details = {}) {
        super(message);
        this.name = "WeatherError";
        this.code = code;
        this.details = details;
    }
}

function getApiKey() {
    const key = import.meta.env.VITE_WEATHER_API_KEY;
    if (!key || key === "your_openweather_api_key") {
        throw new WeatherError(ErrorCode.MISSING_KEY, "No OpenWeather API key configured.");
    }
    return key;
}

async function request(path, params, signal) {
    const url = new URL(path, API_ROOT);
    for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, String(value));
    }
    url.searchParams.set("appid", getApiKey());

    let response;
    try {
        response = await fetch(url, { signal });
    } catch (error) {
        if (error.name === "AbortError") throw error;
        throw new WeatherError(ErrorCode.OFFLINE, "Could not reach OpenWeather.");
    }

    if (response.ok) return response.json();
    if (response.status === 401) throw new WeatherError(ErrorCode.INVALID_KEY, "OpenWeather rejected the API key.");
    if (response.status === 404) throw new WeatherError(ErrorCode.NOT_FOUND, "Location not found.");
    if (response.status === 429) throw new WeatherError(ErrorCode.RATE_LIMITED, "Too many requests to OpenWeather.");
    throw new WeatherError(ErrorCode.UNKNOWN, `OpenWeather responded with status ${response.status}.`);
}

/** Turns "Paris , FR" into "Paris,FR", the format the geocoding API expects. */
export function normalizeQuery(query) {
    return query
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .join(",");
}

/** Finds up to `limit` places matching a free-text query such as "Paris" or "Paris, FR". */
export async function searchPlaces(query, { signal, limit = 5 } = {}) {
    const q = normalizeQuery(query);
    if (!q) return [];
    const results = await request("/geo/1.0/direct", { q, limit }, signal);

    const seen = new Set();
    return results
        .map((r) => ({ name: r.name, state: r.state ?? "", country: r.country ?? "", lat: r.lat, lon: r.lon }))
        .filter((place) => {
            const key = `${place.name}|${place.state}|${place.country}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
}

/** Fetches current conditions and the 5-day / 3-hour forecast for a coordinate, in metric units. */
export async function fetchWeather({ lat, lon }, { signal } = {}) {
    const params = { lat, lon, units: "metric" };
    const [current, forecast] = await Promise.all([
        request("/data/2.5/weather", params, signal),
        request("/data/2.5/forecast", params, signal),
    ]);
    return { current, forecast };
}
