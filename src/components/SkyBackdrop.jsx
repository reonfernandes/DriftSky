import "../styles/sky.css";

/**
 * The full-screen sky behind the app. Its colour comes from the time of day at the location,
 * tinted by the current condition, with a light layer of cloud, rain, snow or stars on top.
 */
export default function SkyBackdrop({ condition, period }) {
    return (
        <div className={`sky sky--${period} sky--${condition}`} aria-hidden="true">
            <div className="sky__tint" />
            <div className="sky__stars" />
            <div className="sky__cloud sky__cloud--1" />
            <div className="sky__cloud sky__cloud--2" />
            <div className="sky__cloud sky__cloud--3" />
            <div className="sky__rain" />
            <div className="sky__snow" />
            <div className="sky__fog" />
            <div className="sky__flash" />
        </div>
    );
}
