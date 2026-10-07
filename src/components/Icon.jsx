const WEATHER_PATHS = {
    sun: (
        <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </>
    ),
    moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
    cloud: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />,
    partly: (
        <>
            <path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M19.07 4.93l-1.41 1.41M15.95 12.65a4 4 0 0 0-5.93-4.13" />
            <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" />
        </>
    ),
    "partly-night": (
        <>
            <path d="M10.1 9A6 6 0 0 1 16 4a4.24 4.24 0 0 0 6 6 6 6 0 0 1-3 5.2" />
            <path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z" />
        </>
    ),
    rain: (
        <>
            <path d="M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24" />
            <path d="M16 14v6M8 14v6M12 16v6" />
        </>
    ),
    storm: (
        <>
            <path d="M6 16.33A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.97" />
            <path d="m13 12-3 5h4l-3 5" />
        </>
    ),
    snow: (
        <>
            <path d="M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24" />
            <path d="M8 15h.01M8 19h.01M12 17h.01M12 21h.01M16 15h.01M16 19h.01" strokeWidth="2.6" />
        </>
    ),
    fog: (
        <>
            <path d="M4 14.9A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.24" />
            <path d="M16 17H7M17 21H9" />
        </>
    ),
};

const UI_PATHS = {
    search: (
        <>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </>
    ),
    locate: (
        <>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
        </>
    ),
    refresh: (
        <>
            <path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" />
            <path d="M21 3v5h-5" />
        </>
    ),
    pin: (
        <>
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
        </>
    ),
};

function Svg({ children, className = "", strokeWidth = 1.8 }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
        >
            {children}
        </svg>
    );
}

/** A weather condition icon, e.g. "sun", "rain" or "partly-night". Tinted per condition in CSS. */
export function WeatherIcon({ name, className = "" }) {
    return (
        <Svg className={`weather-icon weather-icon--${name} ${className}`}>
            {WEATHER_PATHS[name] ?? WEATHER_PATHS.cloud}
        </Svg>
    );
}

export function UiIcon({ name, className = "" }) {
    return (
        <Svg className={`ui-icon ${className}`} strokeWidth={2}>
            {UI_PATHS[name]}
        </Svg>
    );
}

export function Logo() {
    return (
        <svg className="logo-mark" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 12c4-3 8-3 12 0s8 3 12 0" />
            <path d="M4 19c4-3 8-3 12 0s8 3 12 0" opacity=".6" />
            <path d="M4 26c4-3 8-3 12 0s8 3 12 0" opacity=".3" />
        </svg>
    );
}
