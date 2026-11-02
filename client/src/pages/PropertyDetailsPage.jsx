import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import { listingCategoryBySlug } from "../data/listingCategories.js";
import { getPropertyById } from "../services/propertyApi.js";
import { createEnquiry, createVisitRequest } from "../services/propertyRequestApi.js";
import { resolvePropertyImage } from "../services/ownerPropertyApi.js";
import { formatPrice } from "../utils/formatPrice.js";

export default function PropertyDetailsPage() {
  const { propertyId } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [requestMode, setRequestMode] = useState("");
  const [requestForm, setRequestForm] = useState({ subject: "", message: "", preferredDate: "", preferredTime: "" });
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [requestNotice, setRequestNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setActiveImage(0);
    getPropertyById(propertyId, { signal: controller.signal })
      .then((result) => setProperty(result.data))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [propertyId, retryCount]);

  useEffect(() => {
    setRequestMode("");
    setRequestForm({ subject: "", message: "", preferredDate: "", preferredTime: "" });
    setRequestError("");
    setRequestNotice("");
  }, [propertyId]);

  const submitPropertyRequest = async (event) => {
    event.preventDefault();
    setRequestSubmitting(true);
    setRequestError("");
    setRequestNotice("");
    try {
      const idempotencyKey = globalThis.crypto.randomUUID();
      if (requestMode === "enquiry") {
        await createEnquiry(propertyId, {
          subject: requestForm.subject,
          message: requestForm.message,
        }, idempotencyKey);
        setRequestNotice("Your enquiry has been submitted. You can track the response in My Enquiries & Visits.");
      } else {
        await createVisitRequest(propertyId, {
          preferredDate: requestForm.preferredDate,
          preferredTime: requestForm.preferredTime,
          message: requestForm.message,
        }, idempotencyKey);
        setRequestNotice("Your visit request has been sent. This is a request only—not a booking confirmation. Track its status in My Enquiries & Visits.");
      }
      setRequestMode("");
      setRequestForm({ subject: "", message: "", preferredDate: "", preferredTime: "" });
    } catch (requestErrorValue) {
      setRequestError(requestErrorValue.message);
    } finally {
      setRequestSubmitting(false);
    }
  };

  if (loading) {
    return <main className="page-shell listing-state details-load-state" role="status">Loading property details from the EstateSphere API…</main>;
  }

  if (error?.status === 404) {
    return (
      <main className="page-shell not-found-page">
        <span className="eyebrow">PROPERTY NOT FOUND</span>
        <h1>This property could not be found.</h1>
        <p>{error.message}</p>
        <Link className="solid-link" to="/">Return to EstateSphere</Link>
      </main>
    );
  }

  if (error) {
    return (
      <main className="page-shell listing-state listing-state-error details-load-state" role="alert">
        <h1>Property details could not be loaded</h1>
        <p>{error.message}</p>
        <button type="button" onClick={() => setRetryCount((count) => count + 1)}>Try again</button>
      </main>
    );
  }

  if (!property) return null;
  const category = listingCategoryBySlug[property.category];

  return (
    <main className="details-page page-shell">
      <Breadcrumbs items={[
        { label: "Rental Properties", to: "/#categories" },
        { label: category?.label ?? "Properties", to: category?.path ?? "/" },
        { label: property.title },
      ]} />

      <div className="details-heading">
        <div>
          <span className="eyebrow">{property.isDemo ? "DEMONSTRATION PROPERTY" : "PROPERTY DETAILS"}</span>
          <h1>{property.title}</h1>
          <p className="property-location"><span aria-hidden="true">⌖</span>{property.location}</p>
        </div>
        <Link className="back-to-listings" to={category?.path ?? "/"}>← Back to {category?.label ?? "properties"}</Link>
      </div>

      <div className="details-gallery">
        <div className="gallery-main">
          <img
            src={resolvePropertyImage(property.images[activeImage])}
            alt={property.isDemo ? `Illustrative image, not a photograph of ${property.title}` : `${property.title} — photo ${activeImage + 1}`}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/images/flats-apartments.jpg";
            }}
          />
          <span className="gallery-demo-label">{property.isDemo ? "Illustrative image · not this property" : "Property imagery"}</span>
        </div>
        <div className="gallery-thumbnails" aria-label="Property image gallery">
          {property.images.map((image, index) => (
            <button
              type="button"
              className={activeImage === index ? "is-active" : ""}
              key={`${image}-${index}`}
              aria-label={`Show property photo ${index + 1}`}
              aria-pressed={activeImage === index}
              onClick={() => setActiveImage(index)}
            >
              <img
                src={resolvePropertyImage(image)}
                alt=""
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = "/images/flats-apartments.jpg";
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="details-layout">
        <section className="details-content">
          {property.isDemo && (
            <div className="demo-notice" role="note">
              <span aria-hidden="true">i</span>
              <p><strong>Fictional demonstration listing.</strong> This property, address, description and pricing are invented for academic presentation and are not verified or available offers. Images are generic illustrative examples and do not depict this property.</p>
            </div>
          )}

          {property.isDemo ? (
            <div className="request-demo-disabled" role="note">
              <strong>Enquiries and visits are disabled for demonstration listings.</strong>
              <span>These records are fictional and do not represent real owners or places available to visit.</span>
            </div>
          ) : user?.role === "tenant" && property.listingStatus === "approved" && property.availability === "available" ? (
            <section className="property-request-panel" aria-label="Contact property owner">
              <div>
                <span className="eyebrow">CONTACT ABOUT THIS LISTING</span>
                <h2>Interested in this property?</h2>
                <p>Send an enquiry or request a preferred visit time. A visit request is not a booking or confirmation.</p>
              </div>
              {!requestMode ? (
                <div className="property-request-actions">
                  <button type="button" onClick={() => { setRequestMode("enquiry"); setRequestError(""); setRequestNotice(""); }}>Send Enquiry</button>
                  <button type="button" onClick={() => { setRequestMode("visit"); setRequestError(""); setRequestNotice(""); }}>Request Property Visit</button>
                </div>
              ) : (
                <form className="property-request-form" onSubmit={submitPropertyRequest}>
                  <h3>{requestMode === "enquiry" ? "Send an enquiry" : "Request a property visit"}</h3>
                  {requestMode === "enquiry" ? (
                    <>
                      <label>Subject
                        <input required minLength={5} maxLength={120} value={requestForm.subject} onChange={(event) => setRequestForm((current) => ({ ...current, subject: event.target.value }))} />
                      </label>
                      <label>Message
                        <textarea required minLength={10} maxLength={2000} rows={4} value={requestForm.message} onChange={(event) => setRequestForm((current) => ({ ...current, message: event.target.value }))} />
                      </label>
                    </>
                  ) : (
                    <>
                      <div className="property-visit-fields">
                        <label>Preferred date
                          <input required type="date" min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)} max={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)} value={requestForm.preferredDate} onChange={(event) => setRequestForm((current) => ({ ...current, preferredDate: event.target.value }))} />
                        </label>
                        <label>Preferred time
                          <input required type="time" value={requestForm.preferredTime} onChange={(event) => setRequestForm((current) => ({ ...current, preferredTime: event.target.value }))} />
                        </label>
                      </div>
                      <label>Optional message
                        <textarea maxLength={1000} rows={3} value={requestForm.message} onChange={(event) => setRequestForm((current) => ({ ...current, message: event.target.value }))} />
                      </label>
                    </>
                  )}
                  {requestError && <p className="auth-error" role="alert">{requestError}</p>}
                  <div className="property-request-form-actions">
                    <button type="submit" disabled={requestSubmitting}>
                      {requestSubmitting ? "Sending…" : requestMode === "enquiry" ? "Send enquiry" : "Send visit request"}
                    </button>
                    <button type="button" onClick={() => setRequestMode("")} disabled={requestSubmitting}>Cancel</button>
                  </div>
                </form>
              )}
              {requestNotice && <p className="management-notice" role="status">{requestNotice}</p>}
              {requestError && !requestMode && <p className="auth-error" role="alert">{requestError}</p>}
            </section>
          ) : !user && !property.isDemo ? (
            <div className="property-request-panel property-request-signin">
              <p>Sign in as a tenant to enquire about this approved listing or request a visit.</p>
              <Link className="solid-link" to="/login">Sign in to continue <span aria-hidden="true">↗</span></Link>
            </div>
          ) : null}

          <section className="details-section">
            <span className="eyebrow">ABOUT THIS PLACE</span>
            <h2>Property description</h2>
            <p>{property.description}</p>
          </section>
          <section className="details-section">
            <span className="eyebrow">ACCOMMODATION</span>
            <h2>Space and occupancy</h2>
            <p>{property.accommodation}</p>
            <div className="detail-facts">
              <span><strong>Property type</strong>{property.propertyType}</span>
              <span><strong>Bedrooms / room</strong>{property.bedrooms}</span>
              <span><strong>Furnishing</strong>{property.furnishing}</span>
              <span><strong>Location</strong>{property.location}</span>
              <span><strong>Address</strong>{property.address}</span>
            </div>
          </section>
          <section className="details-section">
            <span className="eyebrow">WHAT’S INCLUDED</span>
            <h2>Amenities</h2>
            <ul className="amenities-list">
              {property.amenities.map((amenity) => <li key={amenity}><span aria-hidden="true">✓</span>{amenity}</li>)}
            </ul>
          </section>
        </section>

        <aside className="pricing-card">
          <span className="eyebrow">{property.isDemo ? "SAMPLE PRICING" : "PRICING"}</span>
          <p className="details-rent">
            {formatPrice(property.transactionType === "sale" ? property.askingPrice : property.monthlyRent)}
            <span>{property.transactionType === "sale" ? " asking price" : "/ month"}</span>
          </p>
          {property.transactionType !== "sale" && (
            <div className="pricing-row"><span>Security deposit</span><strong>{formatPrice(property.securityDeposit)}</strong></div>
          )}
          <div className="pricing-row"><span>Furnishing</span><strong>{property.furnishing}</strong></div>
          <div className="pricing-row"><span>Area</span><strong>{property.location}</strong></div>
          {property.isDemo && <p className="pricing-disclaimer">Prices are fictional examples and are not an offer to rent or buy. Transactions are not available.</p>}
          {category && <Link className="solid-link" to={category.path}>Browse more properties</Link>}
        </aside>
      </div>
    </main>
  );
}
