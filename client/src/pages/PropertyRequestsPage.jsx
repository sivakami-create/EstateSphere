import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  decideVisitRequest,
  getMyRequests,
  getReceivedRequests,
  respondToEnquiry,
} from "../services/propertyRequestApi.js";
import { roleRoutes } from "../utils/roles.js";
import { resolvePropertyImage } from "../services/ownerPropertyApi.js";

const statusLabels = {
  submitted: "Awaiting response",
  responded: "Responded",
  accepted: "Request accepted · not a booking",
  declined: "Declined",
};

const typeLabels = {
  enquiry: "Property enquiry",
  visit: "Visit request",
};

function formatDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

function RequestStatus({ status }) {
  return <span className={`management-status request-status status-${status}`}>{statusLabels[status] ?? status}</span>;
}

function RequestHistory({ history = [] }) {
  if (!history.length) return null;
  return (
    <div className="request-history">
      <h4>Request history</h4>
      {history.map((event, index) => (
        <p key={`${event.status}-${event.createdAt}-${index}`}>
          <strong>{statusLabels[event.status] ?? event.status}</strong>
          {" · "}{formatDate(event.createdAt)}
          {event.note && <span>{event.note}</span>}
        </p>
      ))}
    </div>
  );
}

function PropertySummary({ item }) {
  const property = item.property;
  if (!property) {
    return <p className="request-property-unavailable">This property listing is no longer available.</p>;
  }
  return (
    <div className="request-property-summary">
      {property.images?.[0] && <img src={resolvePropertyImage(property.images[0])} alt="" />}
      <div>
        <span className="property-type">{property.category?.replaceAll("-", " ")}</span>
        <h3>{property.title}</h3>
        <p>{property.locality ? `${property.locality}, ` : ""}{property.city}, {property.state}</p>
      </div>
    </div>
  );
}

function TenantRequestCard({ item }) {
  return (
    <article className="request-card">
      <div className="request-card-top">
        <span className="eyebrow">{typeLabels[item.requestType]}</span>
        <RequestStatus status={item.status} />
      </div>
      <PropertySummary item={item} />
      {item.requestType === "enquiry" ? (
        <div className="request-message">
          <h4>{item.subject}</h4>
          <p>{item.message}</p>
        </div>
      ) : (
        <div className="request-message">
          <h4>Preferred visit time</h4>
          <p>{formatDate(item.preferredDate)} at {item.preferredTime}</p>
          {item.message && <p>{item.message}</p>}
        </div>
      )}
      {item.ownerResponse && <p className="request-feedback"><strong>Owner response:</strong> {item.ownerResponse}</p>}
      {item.declineReason && <p className="request-feedback request-feedback-declined"><strong>Reason declined:</strong> {item.declineReason}</p>}
      <p className="request-submitted-date">Submitted {formatDate(item.createdAt)}</p>
      <RequestHistory history={item.history} />
    </article>
  );
}

function OwnerRequestCard({ item, busy, responseText, declineText, onResponseChange, onDeclineChange, onRespond, onDecision }) {
  const tenant = item.tenant;
  const property = item.property;
  return (
    <article className="request-card">
      <div className="request-card-top">
        <span className="eyebrow">{typeLabels[item.requestType]}</span>
        <RequestStatus status={item.status} />
      </div>
      <PropertySummary item={item} />
      <div className="request-tenant-summary">
        <h4>Submitted by</h4>
        <p><strong>{tenant?.fullName ?? "Tenant account unavailable"}</strong>{tenant?.email ? ` · ${tenant.email}` : ""}</p>
        {tenant?.phone && <p>{tenant.phone}</p>}
      </div>
      {item.requestType === "enquiry" ? (
        <div className="request-message">
          <h4>{item.subject}</h4>
          <p>{item.message}</p>
        </div>
      ) : (
        <div className="request-message">
          <h4>Preferred visit time</h4>
          <p>{formatDate(item.preferredDate)} at {item.preferredTime}</p>
          {item.message && <p>{item.message}</p>}
          {item.declineReason && <p className="request-feedback request-feedback-declined"><strong>Reason declined:</strong> {item.declineReason}</p>}
        </div>
      )}
      {item.ownerResponse && <p className="request-feedback"><strong>Your response:</strong> {item.ownerResponse}</p>}

      {item.status === "submitted" && item.requestType === "enquiry" && (
        <form className="request-action-form" onSubmit={(event) => {
          event.preventDefault();
          onRespond(item._id);
        }}>
          <label>
            Respond to enquiry
            <textarea value={responseText} onChange={(event) => onResponseChange(item._id, event.target.value)} required minLength={5} maxLength={2000} rows={3} />
          </label>
          <button className="solid-link" type="submit" disabled={busy || responseText.trim().length < 5}>
            {busy ? "Sending…" : "Send response"}
          </button>
        </form>
      )}

      {item.status === "submitted" && item.requestType === "visit" && (
        <div className="request-action-form">
          <label>
            Reason if declining <span className="auth-optional">Required to decline</span>
            <textarea value={declineText} onChange={(event) => onDeclineChange(item._id, event.target.value)} maxLength={1000} rows={2} />
          </label>
          <div className="request-decision-actions">
            <button className="request-accept-button" type="button" disabled={busy} onClick={() => onDecision(item._id, "accepted")}>
              {busy ? "Saving…" : "Accept request"}
            </button>
            <button className="request-decline-button" type="button" disabled={busy || declineText.trim().length < 10} onClick={() => onDecision(item._id, "declined")}>
              {busy ? "Saving…" : "Decline request"}
            </button>
          </div>
        </div>
      )}

      <p className="request-submitted-date">Received {formatDate(item.createdAt)}{property?.availability === "unavailable" ? " · Property now unavailable" : ""}</p>
      <RequestHistory history={item.history} />
    </article>
  );
}

export default function PropertyRequestsPage({ audience }) {
  const { user } = useAuth();
  const tenantMode = audience === "tenant";
  const expectedRole = tenantMode ? "tenant" : user?.role;
  const workspacePath = roleRoutes[expectedRole] ?? "/";
  const [items, setItems] = useState([]);
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [responses, setResponses] = useState({});
  const [declineReasons, setDeclineReasons] = useState({});
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const loader = tenantMode
      ? getMyRequests({ signal: controller.signal })
      : getReceivedRequests({ ...(type ? { type } : {}), ...(status ? { status } : {}) }, { signal: controller.signal });
    loader
      .then((result) => setItems(result.data))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [tenantMode, type, status, reloadKey]);

  if ((tenantMode && user?.role !== "tenant") || (!tenantMode && !["owner", "pg_operator"].includes(user?.role))) {
    return <Navigate to={roleRoutes[user?.role] ?? "/"} replace />;
  }

  const act = async (requestId, action) => {
    setBusyId(requestId);
    setError("");
    setNotice("");
    try {
      if (action === "respond") {
        await respondToEnquiry(requestId, responses[requestId] ?? "");
        setResponses((current) => ({ ...current, [requestId]: "" }));
        setNotice("Your enquiry response has been sent to the tenant.");
      } else {
        const reason = declineReasons[requestId] ?? "";
        await decideVisitRequest(requestId, action, action === "declined" ? reason : "");
        setDeclineReasons((current) => ({ ...current, [requestId]: "" }));
        setNotice(action === "accepted" ? "The visit request was accepted. This is not a booking confirmation." : "The visit request has been declined with your reason.");
      }
      setReloadKey((current) => current + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyId("");
    }
  };

  const title = tenantMode ? "My Enquiries & Visits" : "Enquiries & Visit Requests";
  const backPath = tenantMode ? workspacePath : `${workspacePath}/properties`;

  return (
    <main className="requests-page page-shell">
      <div className="management-heading">
        <div>
          <span className="eyebrow">{tenantMode ? "TENANT WORKSPACE" : user?.role === "pg_operator" ? "PG OPERATOR WORKSPACE" : "PROPERTY OWNER WORKSPACE"}</span>
          <h1>{title}</h1>
          <p>{tenantMode ? "Track your property enquiries and requested visits. A visit request is not a booking confirmation." : "Review and respond to requests for your own listings. Accepting a visit request does not create a booking."}</p>
        </div>
        <Link className="management-back-link" to={backPath}>{tenantMode ? "← My EstateSphere" : "← My Properties"}</Link>
      </div>

      {notice && <p className="management-notice" role="status">{notice}</p>}
      {error && <div className="listing-state listing-state-error" role="alert"><p>{error}</p><button type="button" onClick={() => setReloadKey((current) => current + 1)}>Try again</button></div>}

      {!tenantMode && (
        <div className="requests-filters">
          <label>Request type
            <select value={type} onChange={(event) => setType(event.target.value)}>
              <option value="">All request types</option>
              <option value="enquiry">Enquiries</option>
              <option value="visit">Visit requests</option>
            </select>
          </label>
          <label>Status
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">All statuses</option>
              {Object.entries(statusLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </label>
        </div>
      )}

      {loading ? <div className="listing-state" role="status">Loading requests…</div>
        : items.length ? (
          <section className="requests-list" aria-label={title}>
            {items.map((item) => tenantMode
              ? <TenantRequestCard key={item._id} item={item} />
              : (
                <OwnerRequestCard
                  key={item._id}
                  item={item}
                  busy={busyId === item._id}
                  responseText={responses[item._id] ?? ""}
                  declineText={declineReasons[item._id] ?? ""}
                  onResponseChange={(id, value) => setResponses((current) => ({ ...current, [id]: value }))}
                  onDeclineChange={(id, value) => setDeclineReasons((current) => ({ ...current, [id]: value }))}
                  onRespond={(id) => act(id, "respond")}
                  onDecision={(id, decision) => act(id, decision)}
                />
              ))}
          </section>
        ) : (
          <div className="empty-results">
            <h2>{tenantMode ? "No enquiries or visits yet" : "No requests received yet"}</h2>
            <p>{tenantMode ? "Requests you submit for approved, real listings will appear here." : "Tenant enquiries and visit requests for your approved listings will appear here."}</p>
            {tenantMode && <Link className="solid-link" to="/">Explore properties <span aria-hidden="true">↗</span></Link>}
          </div>
        )}
    </main>
  );
}
