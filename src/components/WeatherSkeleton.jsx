/** Placeholder in the shape of the weather layout, shown while data loads. */
export default function WeatherSkeleton() {
    return (
        <div className="weather-layout" aria-hidden="true">
            <div className="current">
                <div className="skeleton" style={{ height: 34, width: "60%" }} />
                <div className="skeleton" style={{ height: 16, width: "45%", marginTop: 8 }} />
                <div className="skeleton" style={{ height: 100, width: "55%", marginTop: 16 }} />
                <div className="skeleton" style={{ height: 18, width: "50%", marginTop: 10 }} />
            </div>
            <div className="panel daily">
                <div className="skeleton" style={{ height: 210 }} />
            </div>
            <div className="panel hourly">
                <div className="skeleton" style={{ height: 100 }} />
            </div>
            <div className="details">
                <div className="panel tile tile--sun">
                    <div className="skeleton" style={{ height: 120 }} />
                </div>
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="panel tile">
                        <div className="skeleton" style={{ height: 90 }} />
                    </div>
                ))}
            </div>
        </div>
    );
}
