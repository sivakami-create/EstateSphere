import { useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import LocationSelectors from "../components/LocationSelectors.jsx";
import PropertyCard from "../components/PropertyCard.jsx";
import { getCategoryHeading, listingCategoryBySlug } from "../data/listingCategories.js";
import { getBudgetOptions, getSearchPropertyFilters, propertySearchModes } from "../data/propertySearch.js";
import { getProperties } from "../services/propertyApi.js";
import { formatPrice } from "../utils/formatPrice.js";

function readLocation(searchParams) {
  return {
    state: searchParams.get("state") ?? "",
    city: searchParams.get("city") ?? "",
    locality: searchParams.get("locality") ?? "",
  };
}

export default function ListingPage({ searchMode = false }) {
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const category = listingCategoryBySlug[categorySlug];
  const modeKey = searchMode && propertySearchModes[searchParams.get("mode")]
    ? searchParams.get("mode")
    : "rent";
  const mode = propertySearchModes[modeKey];
  const recentSaleSearch = searchMode && modeKey === "buy" && searchParams.get("sort") === "recent";
  const previousCategory = useRef(categorySlug);
  const [categoryLocation, setCategoryLocation] = useState(() => readLocation(searchParams));
  const [categoryMaxRent, setCategoryMaxRent] = useState("");
  const [categoryPropertyType, setCategoryPropertyType] = useState("");
  const searchLocation = readLocation(searchParams);
  const location = searchMode ? searchLocation : categoryLocation;
  const minBudget = searchMode ? (searchParams.get("minBudget") ?? "") : "";
  const maxBudget = searchMode ? (searchParams.get("maxBudget") ?? "") : categoryMaxRent;
  const selectedPropertyType = searchMode ? (searchParams.get("propertyType") ?? "") : categoryPropertyType;
  const [properties, setProperties] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ propertyTypes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (searchMode || previousCategory.current === categorySlug) return;
    previousCategory.current = categorySlug;
    setCategoryLocation({ state: "", city: "", locality: "" });
    setCategoryMaxRent("");
    setCategoryPropertyType("");
  }, [categorySlug, searchMode]);

  useEffect(() => {
    if (!searchMode && !category) return undefined;

    const controller = new AbortController();
    const modeFilters = searchMode ? getSearchPropertyFilters(modeKey, selectedPropertyType) : {};
    setLoading(true);
    setError("");
    getProperties({
      ...(searchMode
        ? modeFilters
        : { category: categorySlug, propertyType: selectedPropertyType, budget: maxBudget }),
      ...(recentSaleSearch ? { sort: "recent" } : {}),
      state: location.state,
      city: location.city,
      locality: location.locality,
      ...(searchMode
        ? { minBudget, maxBudget }
        : {}),
    }, { signal: controller.signal })
      .then((result) => {
        setProperties(result.data);
        setFilterOptions(result.filters);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [
    category,
    categorySlug,
    location.city,
    location.locality,
    location.state,
    maxBudget,
    minBudget,
    modeKey,
    retryCount,
    recentSaleSearch,
    searchMode,
    selectedPropertyType,
  ]);

  const updateSearchParams = (changes) => {
    const nextParams = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) nextParams.set(key, value);
      else nextParams.delete(key);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const updateSearchLocation = (nextLocation) => {
    updateSearchParams(nextLocation);
  };

  const updateSearchBudget = (key, value) => {
    const nextMin = key === "minBudget" ? value : minBudget;
    const nextMax = key === "maxBudget" ? value : maxBudget;
    updateSearchParams({
      [key]: value,
      ...(nextMin && nextMax && Number(nextMin) > Number(nextMax)
        ? { [key === "minBudget" ? "maxBudget" : "minBudget"]: "" }
        : {}),
    });
  };

  const updateCategoryBudget = (value) => {
    setCategoryMaxRent(value);
  };

  if (!searchMode && !category) {
    return (
      <main className="page-shell not-found-page">
        <span className="eyebrow">PAGE NOT FOUND</span>
        <h1>We couldn’t find that listing category.</h1>
        <Link className="solid-link" to="/">Return to EstateSphere</Link>
      </main>
    );
  }

  const selectedLocation = [location.locality, location.city, location.state].filter(Boolean).join(", ");
  const heading = searchMode
    ? recentSaleSearch
      ? (selectedLocation
        ? `Recently added properties for sale in ${selectedLocation}`
        : "Recently added properties for sale across India")
      : (selectedLocation ? mode.locationHeading.replace("{location}", selectedLocation) : mode.heading)
    : getCategoryHeading(category, location);
  const description = recentSaleSearch
    ? "Browse the latest publicly visible sale listings, ordered by most recently added."
    : searchMode ? mode.description : category.description;
  const pageLabel = recentSaleSearch ? "Recently added properties" : searchMode ? `${mode.label} search` : category.breadcrumb;
  const budgetOptions = searchMode ? (mode.filterBudget ?? getBudgetOptions(modeKey)) : [];
  const propertyTypeOptions = searchMode
    ? mode.propertyTypes
    : filterOptions.propertyTypes.map((type) => ({ value: type, label: type }));

  return (
    <main className="listing-page page-shell">
      <Breadcrumbs items={[{ label: searchMode ? "Property Search" : "Rental Properties", to: "/#categories" }, { label: pageLabel }]} />
      <section className="listing-intro">
        <span className="eyebrow">{searchMode ? `${mode.label.toUpperCase()} SEARCH` : "EXPLORE ESTATESPHERE"}</span>
        <h1>{heading}</h1>
        <p>{description}</p>
      </section>

      <aside className="demo-notice" role="note">
        <span aria-hidden="true">i</span>
        <p><strong>Listing information:</strong> Some properties are fictional demonstration records, clearly labelled as such. Sample details and prices are not verified offers.</p>
      </aside>

      <section className="listing-results" aria-label="Property listings">
        <div className="listing-toolbar">
          <div>
            <span className="eyebrow">YOUR OPTIONS</span>
            <h2 aria-live="polite">{loading ? "Loading properties…" : `${properties.length} ${properties.length === 1 ? "property" : "properties"}`}</h2>
          </div>
          <Link className="listing-reset-link" to="/">Back to home <span aria-hidden="true">↗</span></Link>
        </div>

        <div className={`listing-filters ${searchMode ? "listing-search-filters" : ""}`} aria-label="Filter properties">
          <LocationSelectors
            className="listing-location-selectors"
            value={location}
            onChange={searchMode ? updateSearchLocation : setCategoryLocation}
          />
          {searchMode ? (
            <>
              <label>
                Minimum {modeKey === "buy" ? "purchase budget" : "monthly budget"}
                <select
                  value={minBudget}
                  onChange={(event) => updateSearchBudget("minBudget", event.target.value)}
                >
                  <option value="">No minimum</option>
                  {budgetOptions.filter((option) => !maxBudget || option.value <= Number(maxBudget)).map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Maximum {modeKey === "buy" ? "purchase budget" : "monthly budget"}
                <select
                  value={maxBudget}
                  onChange={(event) => updateSearchBudget("maxBudget", event.target.value)}
                >
                  <option value="">No maximum</option>
                  {budgetOptions.filter((option) => !minBudget || option.value >= Number(minBudget)).map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </>
          ) : (
            <label>
              Maximum monthly budget
              <select value={categoryMaxRent} onChange={(event) => updateCategoryBudget(event.target.value)}>
                <option value="">No maximum</option>
                {[10000, 15000, 20000, 30000, 40000, 50000].map((amount) => (
                  <option value={amount} key={amount}>Up to {formatPrice(amount)}</option>
                ))}
              </select>
            </label>
          )}
          <label>
            Property type
            <select
              value={selectedPropertyType}
              onChange={(event) => searchMode
                ? updateSearchParams({ propertyType: event.target.value })
                : setCategoryPropertyType(event.target.value)}
            >
              <option value="">{searchMode ? (modeKey === "pg" ? "All stays" : "All property types") : "All property types"}</option>
              {propertyTypeOptions.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <div className="listing-state" role="status">Loading properties from the EstateSphere API…</div>
        ) : error ? (
          <div className="listing-state listing-state-error" role="alert">
            <h2>Properties could not be loaded</h2>
            <p>{error}</p>
            <button type="button" onClick={() => setRetryCount((count) => count + 1)}>Try again</button>
          </div>
        ) : properties.length ? (
          <div className="property-grid">
            {properties.map((property) => <PropertyCard property={property} key={property._id} />)}
          </div>
        ) : (
          <div className="empty-results">
            <h2>{selectedLocation ? `No properties in ${location.locality || location.city || location.state} match these filters` : "No properties match those filters"}</h2>
            <p>{modeKey === "buy"
              ? "There are no publicly visible sale listings matching this search yet. EstateSphere does not invent sale listings."
              : selectedLocation
                ? "No listings currently match this location and search. EstateSphere does not generate fictional properties for cities without listings."
                : "Try a wider budget or another property type."}</p>
            <button type="button" onClick={() => {
              if (searchMode) {
                updateSearchParams({
                  state: "",
                  city: "",
                  locality: "",
                  minBudget: "",
                  maxBudget: "",
                  propertyType: "",
                });
              } else {
                setCategoryLocation({ state: "", city: "", locality: "" });
                setCategoryMaxRent("");
                setCategoryPropertyType("");
              }
            }}>Clear filters</button>
          </div>
        )}
      </section>
    </main>
  );
}
