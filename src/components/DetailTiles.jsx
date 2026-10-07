import {
    compassPoint,
    dewPoint,
    distance,
    formatDuration,
    formatTime,
    pressureLabel,
    temperature,
    visibilityLabel,
    windSpeed,
} from "../lib/format";

const DAY = 24 * 3600;

function Tile({ title, className = "", children }) {
    return (
        <section className={`panel tile ${className}`}>
            <h2 className="panel__title">{title}</h2>
            {children}
        </section>
    );
}

function SunTile({ sunrise, sunset, timezone, now }) {
    if (!sunrise || !sunset) {
        return (
            <Tile title="Sun" className="tile--sun">
                <p className="tile__note">The sun doesn't rise or set here today.</p>
            </Tile>
        );
    }

    const isUp = now >= sunrise && now <= sunset;
    const progress = Math.min(1, Math.max(0, (now - sunrise) / (sunset - sunrise)));
    const angle = Math.PI * (1 - progress);
    const x = 110 + 90 * Math.cos(angle);
    const y = 100 - 90 * Math.sin(angle);

    let note;
    if (now < sunrise) note = `Rises in ${formatDuration(sunrise - now)}`;
    else if (isUp) note = `Sets in ${formatDuration(sunset - now)}`;
    // Tomorrow's sunrise is within a few minutes of today's, which is close enough for this label.
    else note = `Rises in about ${formatDuration(sunrise + DAY - now)}`;

    return (
        <Tile title="Sun" className="tile--sun">
            <div className="sun">
                <svg className="sun__arc" viewBox="0 0 220 112" aria-hidden="true">
                    <path className="sun__horizon" d="M8 100H212" />
                    <path className="sun__path" d="M20 100 A90 90 0 0 1 200 100" />
                    {progress > 0 && (
                        <path className="sun__travelled" d={`M20 100 A90 90 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`} />
                    )}
                    <circle className={isUp ? "sun__dot" : "sun__dot is-down"} cx={x.toFixed(1)} cy={y.toFixed(1)} r={isUp ? 8 : 6} />
                </svg>
                <div className="sun__info">
                    <dl className="sun__times">
                        <div>
                            <dt>Sunrise</dt>
                            <dd>{formatTime(sunrise, timezone)}</dd>
                        </div>
                        <div>
                            <dt>Sunset</dt>
                            <dd>{formatTime(sunset, timezone)}</dd>
                        </div>
                        <div>
                            <dt>Daylight</dt>
                            <dd>{formatDuration(sunset - sunrise)}</dd>
                        </div>
                    </dl>
                    <p className="tile__note">{note}</p>
                </div>
            </div>
        </Tile>
    );
}

function WindTile({ wind, units }) {
    if (wind.speed === null) {
        return (
            <Tile title="Wind">
                <p className="tile__value">—</p>
                <p className="tile__note">No wind data right now</p>
            </Tile>
        );
    }

    const speed = windSpeed(wind.speed, units);
    const gust = wind.gust ? windSpeed(wind.gust, units) : null;
    const hasDirection = wind.deg !== null;

    return (
        <Tile title="Wind">
            <div className="wind">
                {hasDirection && (
                    // The arrow points where the wind is going: opposite to where it comes from.
                    <svg className="wind__compass" viewBox="0 0 64 64" aria-hidden="true">
                        <circle cx="32" cy="32" r="28" />
                        <text x="32" y="12">N</text>
                        <g transform={`rotate(${(wind.deg + 180) % 360} 32 32)`}>
                            <path className="wind__arrow" d="M32 14 L38 34 L32 30 L26 34 Z" />
                            <path className="wind__tail" d="M32 30 V48" />
                        </g>
                    </svg>
                )}
                <div>
                    <p className="tile__value">
                        {speed.value}
                        <small>{speed.unit}</small>
                    </p>
                    <p className="tile__note">
                        {hasDirection ? `From the ${compassPoint(wind.deg)}` : "Direction varies"}
                        {gust && gust.value > speed.value && <>, gusts {gust.value}</>}
                    </p>
                </div>
            </div>
        </Tile>
    );
}

export default function DetailTiles({ weather, units, now }) {
    const visibility = weather.visibility === null ? null : distance(weather.visibility, units);

    return (
        <div className="details">
            <SunTile sunrise={weather.sunrise} sunset={weather.sunset} timezone={weather.timezone} now={now} />
            <WindTile wind={weather.wind} units={units} />

            <Tile title="Humidity">
                <p className="tile__value">
                    {weather.humidity}
                    <small>%</small>
                </p>
                <div className="meter" role="presentation">
                    <i style={{ width: `${weather.humidity}%` }} />
                </div>
                <p className="tile__note">Dew point {temperature(dewPoint(weather.temp, weather.humidity), units)}°</p>
            </Tile>

            <Tile title="Pressure">
                <p className="tile__value">
                    {weather.pressure}
                    <small>hPa</small>
                </p>
                <p className="tile__note">{pressureLabel(weather.pressure)}</p>
            </Tile>

            <Tile title="Visibility">
                <p className="tile__value">
                    {visibility ? visibility.value : "—"}
                    {visibility && <small>{visibility.unit}</small>}
                </p>
                <p className="tile__note">{visibility ? visibilityLabel(weather.visibility) : "Not reported"}</p>
            </Tile>
        </div>
    );
}
