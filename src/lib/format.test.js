import { describe, expect, it } from "vitest";
import {
    Units,
    compassPoint,
    dewPoint,
    distance,
    formatDate,
    formatDuration,
    formatHour,
    formatTime,
    localDateKey,
    temperature,
    windSpeed,
} from "./format";

// 2026-10-07 08:50:00 UTC
const T = Date.UTC(2026, 9, 7, 8, 50) / 1000;
const TOKYO = 9 * 3600;
const MUMBAI = 5.5 * 3600;
const NEW_YORK = -4 * 3600;

describe("unit conversion", () => {
    it("rounds Celsius and converts to Fahrenheit", () => {
        expect(temperature(21.4, Units.METRIC)).toBe(21);
        expect(temperature(0, Units.IMPERIAL)).toBe(32);
        expect(temperature(-40, Units.IMPERIAL)).toBe(-40);
    });

    it("never returns negative zero", () => {
        expect(Object.is(temperature(-0.4, Units.METRIC), 0)).toBe(true);
    });

    it("converts wind speed from m/s", () => {
        expect(windSpeed(10, Units.METRIC)).toEqual({ value: 36, unit: "km/h" });
        expect(windSpeed(10, Units.IMPERIAL)).toEqual({ value: 22, unit: "mph" });
    });

    it("converts visibility from metres", () => {
        expect(distance(10000, Units.METRIC)).toEqual({ value: "10.0", unit: "km" });
        expect(distance(10000, Units.IMPERIAL)).toEqual({ value: "6.2", unit: "mi" });
    });
});

describe("time at the location", () => {
    it("formats times in the location's timezone, not the viewer's", () => {
        expect(formatTime(T, TOKYO, "en-US")).toBe("5:50 PM");
        expect(formatTime(T, MUMBAI, "en-US")).toBe("2:20 PM");
        expect(formatTime(T, NEW_YORK, "en-US")).toBe("4:50 AM");
    });

    it("keeps the minutes for slots that don't fall on the hour", () => {
        const slot = Date.UTC(2026, 9, 7, 9, 0) / 1000;
        expect(formatHour(slot, TOKYO, "en-US")).toBe("6 PM");
        expect(formatHour(slot, NEW_YORK, "en-US")).toBe("5 AM");
        expect(formatHour(slot, MUMBAI, "en-US")).toBe("2:30 PM");
    });

    it("formats the local date", () => {
        expect(formatDate(T, TOKYO, "en-GB")).toBe("Wed 7 Oct");
    });

    it("rolls the calendar date over at local midnight", () => {
        const lateUtc = Date.UTC(2026, 9, 7, 20, 0) / 1000;
        expect(localDateKey(lateUtc, 0)).toBe("2026-10-07");
        expect(localDateKey(lateUtc, TOKYO)).toBe("2026-10-08");
    });

    it("formats durations", () => {
        expect(formatDuration(11 * 3600 + 56 * 60)).toBe("11h 56m");
        expect(formatDuration(3 * 3600 + 5 * 60)).toBe("3h 05m");
        expect(formatDuration(28 * 60)).toBe("28m");
    });
});

describe("derived readings", () => {
    it("names compass points", () => {
        expect(compassPoint(0)).toBe("N");
        expect(compassPoint(240)).toBe("WSW");
        expect(compassPoint(350)).toBe("N");
        expect(compassPoint(-90)).toBe("W");
    });

    it("calculates dew point", () => {
        expect(dewPoint(20, 100)).toBeCloseTo(20, 1);
        expect(dewPoint(27, 88)).toBeCloseTo(24.8, 0);
    });
});
