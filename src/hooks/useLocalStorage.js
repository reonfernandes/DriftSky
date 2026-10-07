import { useEffect, useState } from "react";

/** Like useState, but the value is saved in localStorage and restored on the next visit. */
export function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw === null ? initialValue : JSON.parse(raw);
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Storage can be full or blocked (private mode); the app works without it.
        }
    }, [key, value]);

    return [value, setValue];
}
