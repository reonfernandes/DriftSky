import { Units } from "../lib/format";

export default function UnitToggle({ units, onChange }) {
    return (
        <div className="unit-toggle" role="group" aria-label="Temperature unit">
            {[
                [Units.METRIC, "°C"],
                [Units.IMPERIAL, "°F"],
            ].map(([value, label]) => (
                <button key={value} type="button" aria-pressed={units === value} onClick={() => onChange(value)}>
                    {label}
                </button>
            ))}
        </div>
    );
}
