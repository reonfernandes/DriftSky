import { localDateKey } from "./format";

export const Condition = {
    CLEAR: "clear",
    PARTLY: "partly",
    CLOUDY: "cloudy",
    RAIN: "rain",
    STORM: "storm",
    SNOW: "snow",
    FOG: "fog",
};

export const Period = {
    DAWN: "dawn",
    DAY: "day",
    DUSK: "dusk",
    NIGHT: "night",
};

/** Maps an OpenWeather condition id (https://openweathermap.org/weather-conditions) to a broad condition. */
export function conditionFromId(id) {
    if (id >= 200 && id < 300) return Condition.STORM;
    if (id >= 300 && id < 600) return Condition.RAIN;
    if (id >= 600 && id < 700) return Condition.SNOW;
    if (id >= 700 && id < 800) return Condition.FOG;
    if (id === 800) return Condition.CLEAR;
    if (id === 801 || id === 802) return Condition.PARTLY;
    if (id > 802) return Condition.CLOUDY;
    return Condition.CLEAR;
}

const ICONS_BY_CODE = {
    "01d": "sun",
    "01n": "moon",
    "02d": "partly",
    "02n": "partly-night",
    "03": "cloud",
    "04": "cloud",
    "09": "rain",
    "10": "rain",
    "11": "storm",
    "13": "snow",
    "50": "fog",
};

/** Maps an OpenWeather icon code such as "10d" to one of our icon names. */
export function iconFromCode(code = "01d") {
    return ICONS_BY_CODE[code] ?? ICONS_BY_CODE[code.slice(0, 2)] ?? "cloud";
}

const HOUR = 3600;

/**
 * Where the location is in its day, used to colour the sky.
 * Dawn and dusk cover the hour or so around sunrise and sunset.
 */
export function timeOfDay(now, sunrise, sunset, iconCode = "") {
    if (!sunrise || !sunset) return iconCode.endsWith("n") ? Period.NIGHT : Period.DAY;
    const nextSunrise = sunrise + 24 * HOUR;
    if (now >= sunrise - 0.75 * HOUR && now < sunrise + HOUR) return Period.DAWN;
    if (now >= sunrise + HOUR && now < sunset - HOUR) return Period.DAY;
    if (now >= sunset - HOUR && now < sunset + 0.75 * HOUR) return Period.DUSK;
    if (now >= nextSunrise - 0.75 * HOUR) return Period.DAWN;
    return Period.NIGHT;
}

/** The next `count` 3-hour forecast slots after the observation time. */
export function buildHourly(list, observedAt, count = 8) {
    return list
        .filter((entry) => entry.dt > observedAt)
        .slice(0, count)
        .map((entry) => ({
            dt: entry.dt,
            temp: entry.main.temp,
            icon: iconFromCode(entry.weather?.[0]?.icon),
            pop: Math.round((entry.pop ?? 0) * 100),
        }));
}

/**
 * Groups 3-hour forecast slots into calendar days at the location.
 * Today's range also includes the current temperature, so "now" never falls outside it.
 */
export function buildDaily(list, offsetSeconds, current, count = 5) {
    const todayKey = localDateKey(current.dt, offsetSeconds);
    const days = new Map();

    for (const entry of list) {
        const key = localDateKey(entry.dt, offsetSeconds);
        if (!days.has(key)) days.set(key, []);
        days.get(key).push(entry);
    }
    if (!days.has(todayKey)) days.set(todayKey, []);

    return [...days.entries()]
        .filter(([key]) => key >= todayKey)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(0, count)
        .map(([key, entries]) => {
            const temps = entries.flatMap((e) => [e.main.temp_min ?? e.main.temp, e.main.temp_max ?? e.main.temp]);
            if (key === todayKey) temps.push(current.temp);

            // Use the slot closest to 1 PM as the day's representative icon, always in its daytime variant.
            const midday = entries.reduce((best, e) => {
                const hour = new Date((e.dt + offsetSeconds) * 1000).getUTCHours();
                const distance = Math.abs(hour - 13);
                return !best || distance < best.distance ? { entry: e, distance } : best;
            }, null);
            const iconCode = (midday?.entry.weather?.[0]?.icon ?? current.iconCode ?? "01d").replace("n", "d");

            return {
                key,
                dt: entries[0]?.dt ?? current.dt,
                isToday: key === todayKey,
                min: Math.min(...temps),
                max: Math.max(...temps),
                icon: iconFromCode(iconCode),
                pop: Math.round(Math.max(0, ...entries.map((e) => e.pop ?? 0)) * 100),
            };
        });
}

/** Combines the current-weather and forecast responses into the shape the UI renders. */
export function buildWeather({ current, forecast }, place) {
    const weather = current.weather?.[0] ?? {};
    const offset = current.timezone ?? forecast.city?.timezone ?? 0;
    const list = forecast.list ?? [];

    const now = { dt: current.dt, temp: current.main.temp, iconCode: weather.icon };
    const daily = buildDaily(list, offset, now);

    return {
        place: place ?? {
            name: current.name || forecast.city?.name || "Unknown place",
            state: "",
            country: current.sys?.country ?? "",
            lat: current.coord?.lat,
            lon: current.coord?.lon,
        },
        timezone: offset,
        observedAt: current.dt,
        temp: current.main.temp,
        feelsLike: current.main.feels_like,
        humidity: current.main.humidity,
        pressure: current.main.pressure,
        visibility: current.visibility ?? null,
        wind: {
            speed: current.wind?.speed ?? null,
            deg: current.wind?.deg ?? null,
            gust: current.wind?.gust ?? null,
        },
        description: weather.description ?? "",
        iconCode: weather.icon ?? "01d",
        icon: iconFromCode(weather.icon),
        condition: conditionFromId(weather.id ?? 800),
        sunrise: current.sys?.sunrise || null,
        sunset: current.sys?.sunset || null,
        today: daily[0] ? { min: daily[0].min, max: daily[0].max } : null,
        hourly: buildHourly(list, current.dt),
        daily,
    };
}
