import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import LocationSelectors from "../components/LocationSelectors.jsx";
import { createMyProperty, deactivateMyProperty, getMyProperties, getMyProperty, resolvePropertyImage, updateMyProperty } from "../services/ownerPropertyApi.js";
import { roleRoutes } from "../utils/roles.js";
import { formatPrice } from "../utils/formatPrice.js";

const ownerCategories = [
  ["shared-flats", "Shared flats"],
  ["1rk-1bhk", "1 RK & 1 BHK"],
  ["2bhk-3bhk", "2 BHK & 3 BHK"],
  ["independent-houses", "Independent houses"],
  ["residential-sale", "Residential property for sale"],
];
const operatorCategories = [
  ["girls-pg", "Girls PG"],
  ["boys-pg", "Boys PG"],
  ["shared-flats", "Shared accommodation"],
];
const imageLimit = 8;
const imageSizeLimit = 5 * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const statusLabels = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  inactive: "Deactivated",
  active: "Approved",
  demo: "Demonstration",
  draft: "Draft",
  archived: "Archived",
};

function emptyForm(role) {
  const categories = role === "pg_operator" ? operatorCategories : ownerCategories;
  return {
    title: "",
    description: "",
    category: categories[0][0],
    propertyType: "",
    state: "",
    city: "",
    locality: "",
    address: "",
    transactionType: role === "owner" && categories[0][0] === "residential-sale" ? "sale" : "rent",
    monthlyRent: "",
    askingPrice: "",
    securityDeposit: "",
    furnishing: "Unfurnished",
    amenities: "",
    availability: "available",
    bedrooms: "",
    accommodation: "",
  };
}

function toForm(property) {
  return {
    title: property.title,
    description: property.description,
    category: property.category,
    propertyType: property.propertyType,
    state: property.state,
    city: property.city,
    locality: property.locality ?? "",
    address: property.address,
    transactionType: property.transactionType ?? "rent",
    amenities: property.amenities.join(", "),
    monthlyRent: property.monthlyRent ?? "",
    askingPrice: property.askingPrice ?? "",
    securityDeposit: property.securityDeposit ?? "",
    furnishing: property.furnishing,
    availability: property.availability,
    bedrooms: property.bedrooms,
    accommodation: property.accommodation,
  };
}

function StatusBadge({ status }) {
  return <span className={`management-status status-${status}`}>{statusLabels[status] ?? status}</span>;
}

export default function PropertyManagementPage({ mode }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const role = user?.role;
  const isOperator = role === "pg_operator";
  const categories = isOperator ? operatorCategories : ownerCategories;
  const isForm = mode === "new" || mode === "edit";
  const [properties, setProperties] = useState([]);
  const [property, setProperty] = useState(null);
  const [form, setForm] = useState(() => emptyForm(role));
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(mode !== "new");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    setError("");
    setFiles([]);
    if (mode === "new") {
      setProperty(null);
      setExistingImages([]);
      setForm(emptyForm(role));
      setLoading(false);
      setNotice("");
    } else if (mode === "edit") {
      setNotice("");
    }
  }, [mode, propertyId, role]);

  useEffect(() => {
    if (mode !== "list") return undefined;
    const controller = new AbortController();
    setLoading(true);
    getMyProperties({ signal: controller.signal })
      .then((result) => setProperties(result.data))
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [mode]);

  useEffect(() => {
    if (mode !== "edit" && mode !== "details") return undefined;
    const controller = new AbortController();
    setLoading(true);
    getMyProperty(propertyId, { signal: controller.signal })
      .then((result) => {
        setProperty(result);
        setForm(toForm(result));
        setExistingImages(result.images);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [mode, propertyId]);

  const transactionType = form.category === "residential-sale" ? "sale" : form.transactionType;
  const pageTitle = useMemo(() => {
    if (mode === "list") return "My Properties";
    if (mode === "new") return "Add New Property";
    if (mode === "edit") return "Edit Property";
    return "Listing Details";
  }, [mode]);

  if (role !== "owner" && role !== "pg_operator") return <Navigate to={roleRoutes[role] ?? "/"} replace />;

  const selectFiles = (event) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    const allFiles = [...files, ...selected];
    if (allFiles.length + existingImages.length > imageLimit) {
      setError(`Upload no more than ${imageLimit} photographs in total.`);
      return;
    }
    const invalid = selected.find((file) => !allowedImageTypes.includes(file.type) || file.size > imageSizeLimit);
    if (invalid) {
      setError("Use JPEG, PNG or WebP images no larger than 5 MB each.");
      return;
    }
    setError("");
    setFiles(allFiles);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    const values = {
      ...form,
      transactionType,
      amenities: form.amenities.split(",").map((amenity) => amenity.trim()).filter(Boolean),
    };
    delete values.existingImages;
    try {
      const result = mode === "new"
        ? await createMyProperty(values, files)
        : await updateMyProperty(propertyId, values, files, existingImages);
      setNotice(mode === "new" ? "Your property has been submitted for review." : "Your property listing has been updated and submitted for review.");
      navigate(`${roleRoutes[role]}/properties/${result.data._id}`, { replace: true, state: { notice: mode === "new" ? "Your property has been submitted for review." : "Your property listing has been updated and submitted for review." } });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async () => {
    if (!window.confirm("Deactivate this listing? It will no longer be available to the public.")) return;
    setSaving(true);
    setError("");
    try {
      const result = await deactivateMyProperty(propertyId);
      setProperty(result.data);
      setNotice("Listing deactivated. It is no longer publicly available.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const backPath = `${roleRoutes[role]}/properties`;

  return (
    <main className="management-page page-shell">
      <div className="management-heading">
        <div>
          <span className="eyebrow">{isOperator ? "PG OPERATOR WORKSPACE" : "PROPERTY OWNER WORKSPACE"}</span>
          <h1>{pageTitle}</h1>
          <p>Manage your EstateSphere property listings.</p>
        </div>
        {mode === "list" && (
          <div className="management-heading-actions">
            <Link className="management-back-link" to={`${roleRoutes[role]}/requests`}>Enquiries & Visit Requests</Link>
            <Link className="solid-link" to={`${backPath}/new`}>Add New Property <span aria-hidden="true">↗</span></Link>
          </div>
        )}
        {mode !== "list" && <Link className="management-back-link" to={backPath}>← My Properties</Link>}
      </div>

      {notice && <p className="management-notice" role="status">{notice}</p>}
      {error && <div className="listing-state listing-state-error" role="alert"><p>{error}</p></div>}

      {mode === "list" && (
        loading ? <div className="listing-state" role="status">Loading your listings…</div>
          : error ? <button className="management-retry" type="button" onClick={() => window.location.reload()}>Try again</button>
            : properties.length ? (
              <div className="management-list">
                {properties.map((item) => (
                  <article className="management-list-item" key={item._id}>
                    <img src={resolvePropertyImage(item.images[0])} alt="" />
                    <div className="management-list-copy">
                      <span className="property-type">{item.category.replaceAll("-", " ")}</span>
                      <h2><Link to={`${backPath}/${item._id}`}>{item.title}</Link></h2>
                      <p>{item.locality ? `${item.locality}, ` : ""}{item.city}, {item.state}</p>
                      <StatusBadge status={item.listingStatus} />
                      {item.listingStatus === "rejected" && item.rejectionReason && (
                        <p className="management-rejection-feedback"><strong>Administrator feedback:</strong> {item.rejectionReason}</p>
                      )}
                    </div>
                    <div className="management-list-actions">
                      <Link to={`${backPath}/${item._id}`}>Listing Details</Link>
                      <Link to={`${backPath}/${item._id}/edit`}>Edit</Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-results">
                <h2>You haven’t added any properties yet</h2>
                <p>Create a listing to manage your rental, sale or accommodation property.</p>
                <Link className="solid-link" to={`${backPath}/new`}>Add New Property</Link>
              </div>
            )
      )}

      {isForm && (
        loading ? <div className="listing-state" role="status">Loading listing details…</div> : (
          <form className="management-form" onSubmit={submit}>
            <div className="management-form-grid">
              <label className="management-span-all">Property title
                <input required minLength="5" maxLength="140" value={form.title} onChange={(event) => updateField("title", event.target.value)} />
              </label>
              <label>Property category
                <select value={form.category} onChange={(event) => updateField("category", event.target.value)}>
                  {categories.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </select>
              </label>
              <label>Property type
                <input required minLength="2" maxLength="80" placeholder="e.g. 2 BHK apartment" value={form.propertyType} onChange={(event) => updateField("propertyType", event.target.value)} />
              </label>
              <div className="management-span-all">
                <span className="management-field-label">Location</span>
                <LocationSelectors value={form} onChange={(location) => setForm((current) => ({ ...current, ...location }))} />
              </div>
              <label className="management-span-all">Full address
                <input required minLength="5" maxLength="240" value={form.address} onChange={(event) => updateField("address", event.target.value)} />
              </label>
              <label className="management-span-all">Description
                <textarea required minLength="20" maxLength="2000" rows="5" value={form.description} onChange={(event) => updateField("description", event.target.value)} />
              </label>
              <label>{transactionType === "sale" ? "Asking price (INR)" : "Monthly rent (INR)"}
                <input required type="number" min="0" max={transactionType === "sale" ? "1000000000" : "100000000"} step="1" value={transactionType === "sale" ? form.askingPrice : form.monthlyRent} onChange={(event) => updateField(transactionType === "sale" ? "askingPrice" : "monthlyRent", event.target.value)} />
              </label>
              {transactionType === "rent" && <label>Security deposit (INR)
                <input required type="number" min="0" max="100000000" step="1" value={form.securityDeposit} onChange={(event) => updateField("securityDeposit", event.target.value)} />
              </label>}
              <label>Furnishing
                <select value={form.furnishing} onChange={(event) => updateField("furnishing", event.target.value)}>
                  {["Unfurnished", "Semi-furnished", "Furnished", "Fully furnished"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <label>Availability
                <select value={form.availability} onChange={(event) => updateField("availability", event.target.value)}>
                  <option value="available">Available</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </label>
              <label>Bedrooms / room
                <input required maxLength="80" placeholder="e.g. 2 bedrooms" value={form.bedrooms} onChange={(event) => updateField("bedrooms", event.target.value)} />
              </label>
              <label className="management-span-all">Accommodation details
                <input required maxLength="240" placeholder="e.g. Entire apartment · 2 bedrooms · 2 bathrooms" value={form.accommodation} onChange={(event) => updateField("accommodation", event.target.value)} />
              </label>
              <label className="management-span-all">Amenities <span className="auth-optional">Separate items with commas</span>
                <input value={form.amenities} onChange={(event) => updateField("amenities", event.target.value)} placeholder="Wi-Fi, parking, lift" />
              </label>
              <label className="management-span-all">Property photographs
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={selectFiles} />
                <small>JPEG, PNG or WebP · up to 5 MB each · maximum {imageLimit} images. Images are stored on this server.</small>
              </label>
              {(existingImages.length > 0 || files.length > 0) && (
                <div className="management-image-grid management-span-all">
                  {existingImages.map((image) => (
                    <div className="management-image-preview" key={image}>
                      <img src={resolvePropertyImage(image)} alt="Current property photograph" />
                      <button type="button" onClick={() => setExistingImages((current) => current.filter((item) => item !== image))}>Remove</button>
                    </div>
                  ))}
                  {files.map((file, index) => (
                    <div className="management-image-preview" key={`${file.name}-${index}`}>
                      <span>{file.name}</span>
                      <button type="button" onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {mode === "new" && <p className="management-pending-note">New listings are saved as Pending and are not shown publicly until approved.</p>}
            {mode === "edit" && <p className="management-pending-note">Saving edits sends this listing for review again. It will be marked Pending.</p>}
            <button className="auth-submit management-save" type="submit" disabled={saving}>
              {saving ? "Saving…" : mode === "new" ? "Submit for review" : "Save changes"}<span aria-hidden="true">↗</span>
            </button>
          </form>
        )
      )}

      {mode === "details" && (
        loading ? <div className="listing-state" role="status">Loading listing details…</div> : property && (
          <article className="management-detail-card">
            <div className="management-detail-top">
              <div><span className="eyebrow">LISTING STATUS</span><StatusBadge status={property.listingStatus} /></div>
              <div className="management-list-actions">
                <Link to={`${backPath}/${property._id}/edit`}>Edit listing</Link>
                {property.listingStatus !== "inactive" && <button type="button" onClick={deactivate} disabled={saving}>Deactivate listing</button>}
              </div>
            </div>
            <h2>{property.title}</h2>
            <p className="property-location">{property.locality ? `${property.locality}, ` : ""}{property.city}, {property.state}</p>
            <div className="management-image-grid">
              {property.images.map((image) => <img key={image} src={resolvePropertyImage(image)} alt={`${property.title} property photograph`} />)}
            </div>
            <p>{property.description}</p>
            <div className="management-detail-facts">
              <span><strong>Category</strong>{property.category.replaceAll("-", " ")}</span>
              <span><strong>Property type</strong>{property.propertyType}</span>
              <span><strong>Transaction</strong>{property.transactionType === "sale" ? "For sale" : "For rent"}</span>
              <span><strong>{property.transactionType === "sale" ? "Asking price" : "Monthly rent"}</strong>{formatPrice(property.transactionType === "sale" ? property.askingPrice : property.monthlyRent)}</span>
              {property.transactionType !== "sale" && <span><strong>Security deposit</strong>{formatPrice(property.securityDeposit)}</span>}
              <span><strong>Furnishing</strong>{property.furnishing}</span>
              <span><strong>Availability</strong>{property.availability}</span>
              <span><strong>Address</strong>{property.address}</span>
            </div>
            {property.listingStatus === "rejected" && property.rejectionReason && (
              <p className="management-rejection-feedback"><strong>Administrator feedback:</strong> {property.rejectionReason}</p>
            )}
          </article>
        )
      )}
    </main>
  );
}
