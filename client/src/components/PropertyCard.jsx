import { Link } from "react-router-dom";
import { resolvePropertyImage } from "../services/ownerPropertyApi.js";
import { formatPrice } from "../utils/formatPrice.js";

export default function PropertyCard({ property }) {
  const propertyId = property._id;
  const isSale = property.transactionType === "sale";

  return (
    <article className="property-card">
      <Link className="property-card-image" to={`/properties/${propertyId}`} aria-label={`View details for ${property.title}`}>
        <img
          src={resolvePropertyImage(property.images[0])}
          alt={property.isDemo ? `Illustrative image, not a photograph of ${property.title}` : property.title}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/images/flats-apartments.jpg";
          }}
        />
        {property.isDemo && <span className="demo-image-label">Illustrative image · fictional listing</span>}
      </Link>
      <div className="property-card-body">
        <div className="property-card-heading">
          <div>
            <span className="property-type">{property.propertyType}</span>
            <h2>{property.title}</h2>
          </div>
          <span className="property-price">
            {formatPrice(isSale ? property.askingPrice : property.monthlyRent)}
            <small>{isSale ? " asking price" : "/ month"}</small>
          </span>
        </div>
        <p className="property-location"><span aria-hidden="true">⌖</span>{property.location}</p>
        {property.isDemo && <p className="demo-card-notice">Fictional demonstration data. This image is illustrative and does not depict this listing.</p>}
        <div className="property-card-facts">
          <span>{property.bedrooms}</span>
          <span>{property.furnishing}</span>
          {!isSale && <span>Deposit {formatPrice(property.securityDeposit)}</span>}
        </div>
        <div className="property-card-amenities">
          {property.amenities.slice(0, 3).map((amenity) => <span key={amenity}>{amenity}</span>)}
          {property.amenities.length > 3 && <span>+{property.amenities.length - 3} more</span>}
        </div>
        <Link className="property-details-link" to={`/properties/${propertyId}`}>
          View Details <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}
