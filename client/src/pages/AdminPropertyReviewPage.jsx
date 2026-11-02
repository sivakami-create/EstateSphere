import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  approveProperty,
  getReviewProperties,
  getReviewSummary,
  rejectProperty,
  resolveAdminPropertyImage,
} from "../services/adminPropertyApi.js";
import { formatPrice } from "../utils/formatPrice.js";

const statusOptions = [
  ["pending", "Pending Review"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
  ["all", "All submissions"],
];

function formatDate(value) {
  if (!value) return "Not reviewed";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function listingPrice(property) {
  return property.transactionType === "sale"
    ? formatPrice(property.askingPrice)
    : `${formatPrice(property.monthlyRent)} / month`;
}

function ReviewHistory({ property }) {
  const history = property.reviewHistory ?? [];
  if (!history.length && !property.reviewedAt) return <p className="admin-review-meta">No administrator review recorded.</p>;
  return (
    <div className="admin-review-history">
      <h3>Review history</h3>
      {history.map((entry, index) => (
        <p key={`${entry.status}-${entry.reviewedAt}-${index}`}>
          <strong>{entry.status === "approved" ? "Approved" : "Rejected"}</strong>
          {" by "}{entry.reviewedBy?.fullName ?? "Administrator"} · {formatDate(entry.reviewedAt)}
          {entry.reason && <span className="admin-history-reason">{entry.reason}</span>}
        </p>
      ))}
      {!history.length && (
        <p><strong>{property.listingStatus}</strong> · {property.reviewedBy?.fullName ?? "Administrator"} · {formatDate(property.reviewedAt)}</p>
      )}
    </div>
  );
}

function ReviewCard({ property, busy, rejectionReason, onReasonChange, onApprove, onReject }) {
  const owner = property.owner;
  const canReview = property.listingStatus === "pending";

  return (
    <article className="admin-review-card">
      <div className="admin-review-card-heading">
        <div>
          <span className="property-type">{property.category.replaceAll("-", " ")}</span>
          <h3>{property.title}</h3>
          <p>{property.locality ? `${property.locality}, ` : ""}{property.city}, {property.state}</p>
        </div>
        <span className={`management-status status-${property.listingStatus}`}>
          {property.listingStatus === "pending" ? "Pending review" : property.listingStatus}
        </span>
      </div>

      <div className="admin-review-images">
        {property.images.map((image) => (
          <img key={image} src={resolveAdminPropertyImage(image)} alt={`${property.title} property photograph`} />
        ))}
      </div>

      <div className="admin-review-details">
        <section>
          <h4>Listing details</h4>
          <p>{property.description}</p>
          <dl>
            <div><dt>Category / type</dt><dd>{property.category.replaceAll("-", " ")} · {property.propertyType}</dd></div>
            <div><dt>Address</dt><dd>{property.address}</dd></div>
            <div><dt>Price</dt><dd>{listingPrice(property)}</dd></div>
            {property.transactionType !== "sale" && <div><dt>Security deposit</dt><dd>{formatPrice(property.securityDeposit)}</dd></div>}
            <div><dt>Furnishing / availability</dt><dd>{property.furnishing} · {property.availability}</dd></div>
            <div><dt>Accommodation</dt><dd>{property.accommodation}</dd></div>
            <div><dt>Amenities</dt><dd>{property.amenities?.length ? property.amenities.join(", ") : "Not specified"}</dd></div>
          </dl>
        </section>
        <section>
          <h4>Submitted by</h4>
          <p><strong>{owner?.fullName ?? "User account unavailable"}</strong></p>
          {owner && <p>{owner.role === "pg_operator" ? "PG Operator" : "Property Owner"} · {owner.email}</p>}
          {owner?.phone && <p>{owner.phone}</p>}
          <p>Submitted {formatDate(property.createdAt)}</p>
        </section>
      </div>

      <ReviewHistory property={property} />

      {canReview && (
        <div className="admin-review-actions">
          <button className="admin-approve-button" type="button" onClick={() => onApprove(property._id)} disabled={busy}>
            {busy ? "Saving…" : "Approve listing"}
          </button>
          <form onSubmit={(event) => {
            event.preventDefault();
            onReject(property._id);
          }}>
            <label>
              Rejection reason <span>Required · 10–1000 characters</span>
              <textarea
                value={rejectionReason}
                onChange={(event) => onReasonChange(property._id, event.target.value)}
                minLength={10}
                maxLength={1000}
                required
                rows={3}
              />
            </label>
            <button className="admin-reject-button" type="submit" disabled={busy || rejectionReason.trim().length < 10}>
              {busy ? "Saving…" : "Reject listing"}
            </button>
          </form>
        </div>
      )}

      {property.listingStatus === "rejected" && property.rejectionReason && (
        <p className="management-rejection-feedback"><strong>Feedback sent to owner:</strong> {property.rejectionReason}</p>
      )}
    </article>
  );
}

export default function AdminPropertyReviewPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState("pending");
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [properties, setProperties] = useState([]);
  const [reasons, setReasons] = useState({});
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    Promise.all([
      getReviewSummary({ signal: controller.signal }),
      getReviewProperties(status, { signal: controller.signal }),
    ])
      .then(([nextSummary, nextProperties]) => {
        setSummary(nextSummary);
        setProperties(nextProperties);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [status, refreshKey]);

  const runReview = async (propertyId, action) => {
    setBusyId(propertyId);
    setError("");
    try {
      if (action === "approve") {
        await approveProperty(propertyId);
      } else {
        await rejectProperty(propertyId, reasons[propertyId] ?? "");
        setReasons((current) => ({ ...current, [propertyId]: "" }));
      }
      setRefreshKey((current) => current + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId("");
    }
  };

  return (
    <main className="admin-review-page page-shell">
      <div className="management-heading">
        <div>
          <span className="eyebrow">ESTATESPHERE ADMINISTRATION</span>
          <h1>Property review</h1>
          <p>Review owner and PG-operator submissions before they appear in public search.</p>
        </div>
        <Link className="management-back-link" to="/admin">← Administrator workspace</Link>
      </div>

      <section className="admin-summary" aria-label="Property review summary">
        {[
          ["pending", "Pending review"],
          ["approved", "Approved"],
          ["rejected", "Rejected"],
        ].map(([key, label]) => (
          <article key={key}>
            <span>{label}</span>
            <strong>{summary[key]}</strong>
          </article>
        ))}
      </section>

      <div className="admin-review-toolbar">
        <div>
          <span className="eyebrow">SUBMISSIONS</span>
          <h2>{status === "pending" ? "Pending Review" : status === "all" ? "All Submissions" : `${status[0].toUpperCase()}${status.slice(1)} Listings`}</h2>
        </div>
        <label>
          Filter by status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {statusOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
      </div>

      {error && <div className="listing-state listing-state-error" role="alert"><p>{error}</p><button type="button" onClick={() => setRefreshKey((current) => current + 1)}>Try again</button></div>}
      {loading ? <div className="listing-state" role="status">Loading property submissions…</div>
        : properties.length ? (
          <section className="admin-review-list" aria-label="Submitted property listings">
            {properties.map((property) => (
              <ReviewCard
                key={property._id}
                property={property}
                busy={busyId === property._id}
                rejectionReason={reasons[property._id] ?? ""}
                onReasonChange={(id, value) => setReasons((current) => ({ ...current, [id]: value }))}
                onApprove={(id) => runReview(id, "approve")}
                onReject={(id) => runReview(id, "reject")}
              />
            ))}
          </section>
        ) : (
          <div className="empty-results">
            <h2>{status === "pending" ? "No listings are waiting for review" : "No listings in this status"}</h2>
            <p>Submitted owner and PG-operator listings will appear here. Demonstration properties are not part of the review queue.</p>
          </div>
        )}
      <p className="admin-review-signed-in">Signed in as {user?.fullName ?? "Administrator"}</p>
    </main>
  );
}
