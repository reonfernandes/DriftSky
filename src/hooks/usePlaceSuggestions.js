import { useEffect, useState } from "react";
import { searchPlaces } from "../api/openWeather";

const DEBOUNCE_MS = 300;
const MIN_LENGTH = 2;

/**
 * City suggestions for the search box, fetched once the user pauses typing.
 * Only results for the text currently in the box are returned, so a list for
 * an earlier, shorter query is never shown (or picked with Enter) by mistake.
 */
export function usePlaceSuggestions(query) {
    const [result, setResult] = useState({ query: "", places: [] });
    const q = query.trim();

    useEffect(() => {
        if (q.length < MIN_LENGTH) return;

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                const places = await searchPlaces(q, { signal: controller.signal });
                setResult({ query: q, places });
            } catch {
                // Suggestions are optional: on failure the user can still press Enter to search.
                if (!controller.signal.aborted) setResult({ query: q, places: [] });
            }
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [q]);

    return q.length >= MIN_LENGTH && result.query === q ? result.places : [];
}
