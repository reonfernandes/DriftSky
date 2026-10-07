import { useEffect } from "react";
import CurrentConditions from "./components/CurrentConditions";
import DailyForecast from "./components/DailyForecast";
import DetailTiles from "./components/DetailTiles";
import ErrorState from "./components/ErrorState";
import Footer from "./components/Footer";
import HourlyForecast from "./components/HourlyForecast";
import { Logo } from "./components/Icon";
import RecentPlaces from "./components/RecentPlaces";
import SearchBar from "./components/SearchBar";
import SkyBackdrop from "./components/SkyBackdrop";
import UnitToggle from "./components/UnitToggle";
import WeatherSkeleton from "./components/WeatherSkeleton";
import Welcome from "./components/Welcome";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useNow } from "./hooks/useNow";
import { useWeather } from "./hooks/useWeather";
import { Units } from "./lib/format";
import { addRecentPlace } from "./lib/places";
import { Condition, Period, timeOfDay } from "./lib/weather";
import "./styles/layout.css";
import "./styles/weather.css";

/** Sky for the welcome screen: clear, matched to the viewer's own time of day. */
function viewerPeriod() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 8) return Period.DAWN;
    if (hour >= 8 && hour < 18) return Period.DAY;
    if (hour >= 18 && hour < 20) return Period.DUSK;
    return Period.NIGHT;
}

/** Short message for screen readers, so they hear what changed without the whole page being read out. */
function statusMessage(status, weather) {
    if (status === "loading") return "Loading weather…";
    if (status === "success" && weather) return `Showing weather for ${weather.place.name}`;
    return "";
}

export default function App() {
    const [units, setUnits] = useLocalStorage("driftsky:units", Units.METRIC);
    const [recent, setRecent] = useLocalStorage("driftsky:recent", []);
    const [lastPlace, setLastPlace] = useLocalStorage("driftsky:last-place", null);
    const { status, weather, error, showPlace, searchQuery, showMyLocation, reload, dismissError } = useWeather();
    const now = useNow();

    // Reopen the last city on startup. Location is only requested when the user asks for it.
    useEffect(() => {
        if (lastPlace) showPlace(lastPlace);
        // Run once on mount; later changes to lastPlace come from loads this effect would repeat.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (status !== "success" || !weather) return;
        setLastPlace(weather.place);
        setRecent((list) => addRecentPlace(list, weather.place));
    }, [status, weather, setLastPlace, setRecent]);

    useEffect(() => {
        document.title = weather ? `${weather.place.name} · DriftSky` : "DriftSky";
    }, [weather]);

    const condition = weather?.condition ?? Condition.CLEAR;
    const period = weather ? timeOfDay(now, weather.sunrise, weather.sunset, weather.iconCode) : viewerPeriod();

    return (
        <>
            <SkyBackdrop condition={condition} period={period} />
            <div className="app">
                <header className="topbar">
                    <p className="brand">
                        <Logo />
                        DriftSky
                    </p>
                    <SearchBar onSelectPlace={showPlace} onSearch={searchQuery} onLocate={showMyLocation} />
                    <UnitToggle units={units} onChange={setUnits} />
                </header>

                <RecentPlaces places={recent} current={weather?.place} onSelect={showPlace} />

                <p className="visually-hidden" role="status">
                    {statusMessage(status, weather)}
                </p>

                <main className="content" aria-busy={status === "loading"}>
                    {status === "loading" && <WeatherSkeleton />}
                    {status === "error" && (
                        <ErrorState error={error} previousPlace={weather?.place} onRetry={reload} onDismiss={dismissError} />
                    )}
                    {status === "idle" && <Welcome onSelect={showPlace} onLocate={showMyLocation} />}
                    {status === "success" && weather && (
                        <div className="weather-layout">
                            <CurrentConditions weather={weather} units={units} now={now} />
                            <DailyForecast weather={weather} units={units} />
                            <HourlyForecast weather={weather} units={units} />
                            <DetailTiles weather={weather} units={units} now={now} />
                        </div>
                    )}
                </main>

                <Footer fetchedAt={weather?.fetchedAt} now={now} onRefresh={reload} refreshing={status === "loading"} />
            </div>
        </>
    );
}
