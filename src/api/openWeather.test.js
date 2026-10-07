import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorCode, fetchWeather, normalizeQuery, searchPlaces } from "./openWeather";

function respondWith(status, body = {}) {
    return vi.fn().mockResolvedValue({ ok: status >= 200 && status < 300, status, json: async () => body });
}

beforeEach(() => {
    vi.stubEnv("VITE_WEATHER_API_KEY", "test-key");
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

describe("normalizeQuery", () => {
    it("trims each part and drops empty ones", () => {
        expect(normalizeQuery("  Paris , FR ")).toBe("Paris,FR");
        expect(normalizeQuery("London,,")).toBe("London");
        expect(normalizeQuery(" , ")).toBe("");
    });
});

describe("searchPlaces", () => {
    it("encodes the query and removes duplicate results", async () => {
        const fetch = respondWith(200, [
            { name: "São Paulo", state: "São Paulo", country: "BR", lat: -23.55, lon: -46.63 },
            { name: "São Paulo", state: "São Paulo", country: "BR", lat: -23.56, lon: -46.64 },
        ]);
        vi.stubGlobal("fetch", fetch);

        const places = await searchPlaces("São Paulo & more");

        const url = fetch.mock.calls[0][0];
        expect(url.searchParams.get("q")).toBe("São Paulo & more");
        expect(url.toString()).toContain("q=S%C3%A3o+Paulo+%26+more");
        expect(url.searchParams.get("appid")).toBe("test-key");
        expect(places).toHaveLength(1);
    });

    it("skips the request for an empty query", async () => {
        const fetch = vi.fn();
        vi.stubGlobal("fetch", fetch);
        expect(await searchPlaces(" , ")).toEqual([]);
        expect(fetch).not.toHaveBeenCalled();
    });
});

describe("fetchWeather errors", () => {
    it.each([
        [401, ErrorCode.INVALID_KEY],
        [404, ErrorCode.NOT_FOUND],
        [429, ErrorCode.RATE_LIMITED],
        [500, ErrorCode.UNKNOWN],
    ])("maps HTTP %i to %s", async (status, code) => {
        vi.stubGlobal("fetch", respondWith(status));
        await expect(fetchWeather({ lat: 1, lon: 2 })).rejects.toMatchObject({ code });
    });

    it("reports a network failure as offline", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
        await expect(fetchWeather({ lat: 1, lon: 2 })).rejects.toMatchObject({ code: ErrorCode.OFFLINE });
    });

    it("passes cancellations through unchanged", async () => {
        const abort = new DOMException("Aborted", "AbortError");
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(abort));
        await expect(fetchWeather({ lat: 1, lon: 2 })).rejects.toBe(abort);
    });

    it.each(["", "your_openweather_api_key"])("needs a real API key (got %j)", async (key) => {
        vi.stubEnv("VITE_WEATHER_API_KEY", key);
        const fetch = vi.fn();
        vi.stubGlobal("fetch", fetch);
        await expect(fetchWeather({ lat: 1, lon: 2 })).rejects.toMatchObject({ code: ErrorCode.MISSING_KEY });
        expect(fetch).not.toHaveBeenCalled();
    });
});
