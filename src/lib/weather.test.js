import { describe, expect, it } from "vitest";
import { Condition, Period, buildDaily, buildHourly, buildWeather, conditionFromId, iconFromCode, timeOfDay } from "./weather";

const HOUR = 3600;
const MIDNIGHT_UTC = Date.UTC(2026, 9, 7) / 1000;

function slot(hoursFromMidnight, temp, { icon = "01d", pop = 0 } = {}) {
    return {
        dt: MIDNIGHT_UTC + hoursFromMidnight * HOUR,
        main: { temp, temp_min: temp, temp_max: temp },
        weather: [{ icon }],
        pop,
    };
}

describe("conditions and icons", () => {
    it("maps OpenWeather ids to broad conditions", () => {
        expect(conditionFromId(211)).toBe(Condition.STORM);
        expect(conditionFromId(501)).toBe(Condition.RAIN);
        expect(conditionFromId(600)).toBe(Condition.SNOW);
        expect(conditionFromId(741)).toBe(Condition.FOG);
        expect(conditionFromId(800)).toBe(Condition.CLEAR);
        expect(conditionFromId(802)).toBe(Condition.PARTLY);
        expect(conditionFromId(804)).toBe(Condition.CLOUDY);
    });

    it("maps icon codes with day and night variants", () => {
        expect(iconFromCode("01d")).toBe("sun");
        expect(iconFromCode("01n")).toBe("moon");
        expect(iconFromCode("04n")).toBe("cloud");
        expect(iconFromCode("10d")).toBe("rain");
        expect(iconFromCode("unknown")).toBe("cloud");
    });
});

describe("timeOfDay", () => {
    const sunrise = MIDNIGHT_UTC + 6 * HOUR;
    const sunset = MIDNIGHT_UTC + 18 * HOUR;

    it.each([
        [3, Period.NIGHT],
        [5.5, Period.DAWN],
        [6.5, Period.DAWN],
        [12, Period.DAY],
        [17.5, Period.DUSK],
        [18.5, Period.DUSK],
        [22, Period.NIGHT],
        [29.5, Period.DAWN],
    ])("at %s h it is %s", (hours, expected) => {
        expect(timeOfDay(MIDNIGHT_UTC + hours * HOUR, sunrise, sunset)).toBe(expected);
    });

    it("falls back to the icon during polar day or night", () => {
        expect(timeOfDay(MIDNIGHT_UTC, 0, 0, "13n")).toBe(Period.NIGHT);
        expect(timeOfDay(MIDNIGHT_UTC, 0, 0, "01d")).toBe(Period.DAY);
    });
});

describe("forecast grouping", () => {
    const list = [
        slot(9, 14),
        slot(12, 18, { pop: 0.2 }),
        slot(15, 17, { icon: "10d", pop: 0.65 }),
        slot(21, 12, { icon: "01n" }),
        slot(24 + 3, 9, { icon: "01n" }),
        slot(24 + 12, 15, { icon: "04d" }),
        slot(48 + 12, 20, { icon: "13d" }),
    ];
    const current = { dt: MIDNIGHT_UTC + 8 * HOUR, temp: 11, iconCode: "01d" };

    it("groups slots into local days with min, max and highest chance of rain", () => {
        const days = buildDaily(list, 0, current);
        expect(days).toHaveLength(3);
        expect(days[0]).toMatchObject({ key: "2026-10-07", isToday: true, min: 11, max: 18, pop: 65, icon: "sun" });
        expect(days[1]).toMatchObject({ key: "2026-10-08", min: 9, max: 15, icon: "cloud" });
        expect(days[2]).toMatchObject({ key: "2026-10-09", icon: "snow" });
    });

    it("uses the location's timezone to decide which day a slot belongs to", () => {
        const days = buildDaily(list, 4 * HOUR, current);
        // 21:00 UTC is 01:00 the next day at UTC+4.
        expect(days[1].key).toBe("2026-10-08");
        expect(days[1].min).toBe(9);
        expect(days[1].max).toBe(15);
    });

    it("lists the next slots after the observation time", () => {
        const hourly = buildHourly(list, MIDNIGHT_UTC + 10 * HOUR, 3);
        expect(hourly.map((h) => h.temp)).toEqual([18, 17, 12]);
        expect(hourly[1]).toMatchObject({ icon: "rain", pop: 65 });
    });
});

describe("buildWeather", () => {
    it("survives a response without wind or visibility", () => {
        const weather = buildWeather({
            current: {
                dt: MIDNIGHT_UTC,
                timezone: 0,
                name: "Somewhere",
                sys: { country: "XX" },
                coord: { lat: 1, lon: 2 },
                main: { temp: 0, feels_like: -2, humidity: 50, pressure: 1012 },
                weather: [{ id: 800, icon: "01n", description: "clear sky" }],
            },
            forecast: { list: [] },
        });
        expect(weather.wind.speed).toBeNull();
        expect(weather.visibility).toBeNull();
        expect(weather.temp).toBe(0);
        expect(weather.place).toMatchObject({ name: "Somewhere", country: "XX" });
        expect(weather.daily).toHaveLength(1);
    });
});
