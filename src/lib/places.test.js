import { describe, expect, it } from "vitest";
import { addRecentPlace, samePlace } from "./places";

const london = { name: "London", lat: 51.5, lon: -0.12 };
const tokyo = { name: "Tokyo", lat: 35.68, lon: 139.76 };
const paris = { name: "Paris", lat: 48.85, lon: 2.35 };

describe("recent places", () => {
    it("treats nearby coordinates as the same place", () => {
        expect(samePlace(london, { lat: 51.51, lon: -0.13 })).toBe(true);
        expect(samePlace(london, paris)).toBe(false);
    });

    it("adds new places to the front", () => {
        expect(addRecentPlace([london, tokyo], paris)).toEqual([paris, london, tokyo]);
    });

    it("keeps an existing place where it is", () => {
        const renamed = { ...tokyo, name: "Tōkyō" };
        expect(addRecentPlace([london, tokyo], renamed)).toEqual([london, renamed]);
    });

    it("keeps at most six places", () => {
        const many = Array.from({ length: 6 }, (_, i) => ({ name: `P${i}`, lat: i, lon: i }));
        const result = addRecentPlace(many, paris);
        expect(result).toHaveLength(6);
        expect(result[0]).toBe(paris);
    });
});
