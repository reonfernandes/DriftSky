import { useId, useState } from "react";
import { usePlaceSuggestions } from "../hooks/usePlaceSuggestions";
import { UiIcon } from "./Icon";
import "../styles/search.css";

/**
 * City search with suggestions as you type.
 * Arrow keys move through suggestions, Enter picks one (or searches the typed text), Escape closes the list.
 */
export default function SearchBar({ onSelectPlace, onSearch, onLocate }) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const suggestions = usePlaceSuggestions(query);
    const id = useId();
    const listId = `${id}-suggestions`;
    const showList = open && suggestions.length > 0;

    function reset() {
        setQuery("");
        setOpen(false);
        setActive(-1);
    }

    function choose(place) {
        onSelectPlace(place);
        reset();
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (showList && active >= 0) {
            choose(suggestions[active]);
        } else if (query.trim()) {
            onSearch(query.trim());
            reset();
        }
    }

    function handleKeyDown(event) {
        if (event.key === "Escape") {
            // Browsers clear a search input on Escape; when the list is open, only close the list.
            if (showList) event.preventDefault();
            setOpen(false);
            setActive(-1);
            return;
        }
        if (!showList || (event.key !== "ArrowDown" && event.key !== "ArrowUp")) return;
        event.preventDefault();
        const count = suggestions.length;
        setActive((current) =>
            event.key === "ArrowDown" ? (current + 1) % count : current <= 0 ? count - 1 : current - 1,
        );
    }

    return (
        <form className="search" role="search" onSubmit={handleSubmit} autoComplete="off">
            <label htmlFor={`${id}-input`} className="visually-hidden">
                Search for a city
            </label>
            <UiIcon name="search" className="search__icon" />
            <input
                id={`${id}-input`}
                className="search__input"
                type="search"
                placeholder="Search a city, e.g. Lisbon or Paris, FR"
                value={query}
                onChange={(event) => {
                    setQuery(event.target.value);
                    setOpen(true);
                    setActive(-1);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onKeyDown={handleKeyDown}
                role="combobox"
                aria-expanded={showList}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
                enterKeyHint="search"
            />
            <button type="button" className="search__locate" onClick={onLocate} aria-label="Use my location" title="Use my location">
                <UiIcon name="locate" />
            </button>

            <ul className="search__list" id={listId} role="listbox" hidden={!showList}>
                {suggestions.map((place, index) => (
                    <li
                        key={`${place.lat},${place.lon}`}
                        id={`${listId}-${index}`}
                        role="option"
                        aria-selected={index === active}
                        className={index === active ? "search__option is-active" : "search__option"}
                        // mousedown fires before the input's blur, so the list is still there to click.
                        onMouseDown={(event) => {
                            event.preventDefault();
                            choose(place);
                        }}
                        onMouseEnter={() => setActive(index)}
                    >
                        <span>
                            {place.name}
                            {place.country && <span className="search__country">, {place.country}</span>}
                        </span>
                        {place.state && <small>{place.state}</small>}
                    </li>
                ))}
            </ul>
        </form>
    );
}
