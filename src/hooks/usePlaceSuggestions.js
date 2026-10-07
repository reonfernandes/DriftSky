import { useEffect, useState } from "react";
import { searchPlaces } from "../api/openWeather";

const DEBOUNCE_MS = 300;

/** City suggestions for the search box, fetched once the user pauses typing. */
export function usePlaceSuggestions(query) {
    const [suggestions, setSuggestions] = useState([]);

    useEffect(() => {
        const q = query.trim();
        if (q.length < 2) {
            setSuggestions([]);
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                setSuggestions(await searchPlaces(q, { signal: controller.signal }));
            } catch {
                // Suggestions are optional: on failure the user can still press Enter to search.
                if (!controller.signal.aborted) setSuggestions([]);
            }
        }, DEBOUNCE_MS);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    return suggestions;
}
