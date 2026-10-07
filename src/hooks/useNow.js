import { useEffect, useState } from "react";

const nowInSeconds = () => Math.floor(Date.now() / 1000);

/** Current Unix time in seconds, refreshed every `intervalMs` so clocks and "updated" labels stay current. */
export function useNow(intervalMs = 60_000) {
    const [now, setNow] = useState(nowInSeconds);

    useEffect(() => {
        const id = setInterval(() => setNow(nowInSeconds()), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);

    return now;
}
