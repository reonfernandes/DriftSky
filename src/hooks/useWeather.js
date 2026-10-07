import { useCallback, useEffect, useRef, useState } from "react";
import { ErrorCode, WeatherError, fetchWeather, searchPlaces } from "../api/openWeather";
import { buildWeather } from "../lib/weather";

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map();

const cacheKey = ({ lat, lon }) => `${lat.toFixed(2)},${lon.toFixed(2)}`;

async function loadPlace(place, signal, force) {
    const key = cacheKey(place);
    const hit = cache.get(key);
    // Places from search carry a name; a bare coordinate (from geolocation) takes its name from the API.
    const namedPlace = place.name ? place : undefined;

    if (!force && hit && Date.now() - hit.fetchedAt < CACHE_TTL_MS) {
        return namedPlace ? { ...hit, place: namedPlace } : hit;
    }

    const raw = await fetchWeather(place, { signal });
    const weather = { ...buildWeather(raw, namedPlace), fetchedAt: Date.now() };
    cache.set(key, weather);
    return weather;
}

function getPosition() {
    return new Promise((resolve, reject) => {
        if (!("geolocation" in navigator)) {
            reject(new WeatherError(ErrorCode.LOCATION_UNAVAILABLE, "This browser can't share its location."));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => resolve({ lat: coords.latitude, lon: coords.longitude }),
            (error) =>
                reject(
                    error.code === error.PERMISSION_DENIED
                        ? new WeatherError(ErrorCode.LOCATION_DENIED, "Location permission was denied.")
                        : new WeatherError(ErrorCode.LOCATION_UNAVAILABLE, "Your location could not be determined."),
                ),
            { timeout: 10_000, maximumAge: 5 * 60 * 1000 },
        );
    });
}

/**
 * Loads weather for a place, a search query, or the user's location.
 * Starting a new request cancels the one in flight, so a slow response can never replace a newer one.
 */
export function useWeather() {
    const [state, setState] = useState({ status: "idle", weather: null, error: null });
    const controllerRef = useRef(null);
    const lastTaskRef = useRef(null);

    const run = useCallback(async (task, { force = false } = {}) => {
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        lastTaskRef.current = task;

        setState((s) => ({ ...s, status: "loading", error: null }));
        try {
            const weather = await task(controller.signal, force);
            if (controller.signal.aborted) return;
            setState({ status: "success", weather, error: null });
        } catch (error) {
            if (controller.signal.aborted || error.name === "AbortError") return;
            const weatherError =
                error instanceof WeatherError ? error : new WeatherError(ErrorCode.UNKNOWN, error.message);
            setState((s) => ({ ...s, status: "error", error: weatherError }));
        }
    }, []);

    useEffect(() => () => controllerRef.current?.abort(), []);

    const showPlace = useCallback((place) => run((signal, force) => loadPlace(place, signal, force)), [run]);

    const searchQuery = useCallback(
        (query) =>
            run(async (signal, force) => {
                const [match] = await searchPlaces(query, { signal, limit: 1 });
                if (!match) throw new WeatherError(ErrorCode.NOT_FOUND, "No matching city.", { query });
                return loadPlace(match, signal, force);
            }),
        [run],
    );

    const showMyLocation = useCallback(
        () =>
            run(async (signal, force) => {
                const coords = await getPosition();
                return loadPlace(coords, signal, force);
            }),
        [run],
    );

    /** Repeats the last request, skipping the cache. Used by "Try again" and the refresh button. */
    const reload = useCallback(() => {
        if (lastTaskRef.current) run(lastTaskRef.current, { force: true });
    }, [run]);

    /** Leaves an error and goes back to the last weather shown, if any. */
    const dismissError = useCallback(() => {
        setState((s) => ({ status: s.weather ? "success" : "idle", weather: s.weather, error: null }));
    }, []);

    return { ...state, showPlace, searchQuery, showMyLocation, reload, dismissError };
}
