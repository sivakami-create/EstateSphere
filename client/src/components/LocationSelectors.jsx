import { useEffect, useState } from "react";
import { getIndiaLocations } from "../services/locationApi.js";

export default function LocationSelectors({ value, onChange, className = "" }) {
  const [catalog, setCatalog] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getIndiaLocations({ signal: controller.signal })
      .then(setCatalog)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      });
    return () => controller.abort();
  }, []);

  const selectedState = catalog.find((item) => item.name === value.state);
  const selectedCity = selectedState?.cities.find((item) => item.name === value.city);
  const localities = selectedCity?.localities ?? [];

  const update = (changes) => onChange({ ...value, ...changes });

  return (
    <div className={`location-selector-wrap ${className}`.trim()}>
      <div className="location-selector-grid">
        <label>
          State / Union Territory
          <select
            aria-label="State / Union Territory"
            value={value.state}
            onChange={(event) => update({ state: event.target.value, city: "", locality: "" })}
          >
            <option value="">All states and union territories</option>
            {catalog.map((state) => <option key={state.name} value={state.name}>{state.name}</option>)}
          </select>
        </label>
        <label>
          City
          <select
            aria-label="City"
            value={value.city}
            disabled={!selectedState}
            onChange={(event) => update({ city: event.target.value, locality: "" })}
          >
            <option value="">{selectedState ? "All cities" : "Choose a state first"}</option>
            {selectedState?.cities.map((city) => <option key={city.name} value={city.name}>{city.name}</option>)}
          </select>
        </label>
        <label>
          Area / Locality
          <select
            aria-label="Area / Locality"
            value={value.locality}
            disabled={!selectedCity || localities.length === 0}
            onChange={(event) => update({ locality: event.target.value })}
          >
            <option value="">{selectedCity ? (localities.length ? "All localities" : "No curated locality options") : "Choose a city first"}</option>
            {localities.map((locality) => <option key={locality} value={locality}>{locality}</option>)}
          </select>
        </label>
      </div>
      {error ? (
        <p className="location-selector-message" role="alert">{error}</p>
      ) : (
        <p className="location-selector-message">Locality options are curated examples and are not exhaustive.</p>
      )}
    </div>
  );
}
