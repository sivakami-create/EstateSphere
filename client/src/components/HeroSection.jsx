import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getIndiaLocations } from "../services/locationApi.js";
import { getBudgetOptions } from "../data/propertySearch.js";

const budgetOptions = getBudgetOptions("all");

export default function HeroSection() {
  const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [locationError, setLocationError] = useState("");
  const [state, setState] = useState("");
  const [budget, setBudget] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getIndiaLocations({ signal: controller.signal })
      .then(setStates)
      .catch((error) => {
        if (error.name !== "AbortError") setLocationError(error.message);
      });
    return () => controller.abort();
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = new URLSearchParams({ mode: "all" });
    if (state) query.set("state", state);
    const selectedBudget = budgetOptions.find((option) => option.value === budget);
    if (selectedBudget?.min !== undefined) query.set("minBudget", String(selectedBudget.min));
    if (selectedBudget?.max !== undefined) query.set("maxBudget", String(selectedBudget.max));
    navigate(`/search?${query.toString()}`);
  };

  return (
    <section className="hero" id="home">
      <div className="hero-image" aria-hidden="true" />
      <div className="hero-shade" aria-hidden="true" />
      <div className="hero-content page-shell">
        <div className="hero-copy">
          <span className="hero-kicker"><span /> YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>Find a place<br />to <em>feel at home.</em></h1>
          <p>From your first room to a forever home, find a space that fits the way you want to live.</p>
          <div className="hero-proof">
            <span className="proof-icon">✦</span>
            <span>Thoughtful spaces. Trusted connections.</span>
          </div>
        </div>

        <form className="search-card search-card-simple" onSubmit={handleSearch}>
          <label className="search-control">
            State / Union Territory
            <select
              aria-label="State / Union Territory"
              value={state}
              onChange={(event) => setState(event.target.value)}
              disabled={states.length === 0}
            >
              <option value="">All States & Union Territories</option>
              {states.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
            </select>
          </label>
          <label className="search-control">
            Monthly budget
            <select
              aria-label="Monthly budget"
              value={budget}
              onChange={(event) => setBudget(event.target.value)}
            >
              {budgetOptions.map((option) => (
                <option key={option.value || "unrestricted"} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <button className="search-submit" type="submit">
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            Search Properties
          </button>
          {locationError && <p className="search-feedback" role="alert">{locationError}</p>}
        </form>
      </div>
      <a className="hero-scroll" href="#categories"><span /> Scroll to explore</a>
    </section>
  );
}
