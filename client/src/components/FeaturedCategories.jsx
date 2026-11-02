import { useState } from "react";
import { Link } from "react-router-dom";

const categories = [
  {
    title: "Girls PG",
    subtitle: "Comfort, community & care",
    count: "A stay that feels like yours",
    image: "/images/girls-pg.jpg",
    imageAlt: "Bright, furnished interior for a girls PG accommodation",
    path: "/listings/girls-pg",
    className: "category-large",
  },
  {
    title: "Boys PG",
    subtitle: "A better place to settle in",
    count: "Find your next stay",
    image: "/images/boys-pg.jpg",
    imageAlt: "Comfortable furnished interior for a boys PG accommodation",
    path: "/listings/boys-pg",
  },
  {
    title: "Flats & Apartments",
    subtitle: "Room for the life you live",
    count: "1 RK to 3 BHK",
    image: "/images/flats-apartments.jpg",
    imageAlt: "Modern apartment living room with contemporary furnishings",
    path: "/listings/1rk-1bhk",
  },
  {
    title: "House Rentals",
    subtitle: "Space to make your own",
    count: "Independent homes",
    image: "/images/house-rentals.jpg",
    imageAlt: "Independent house with a landscaped front garden",
    path: "/listings/independent-houses",
  },
];

export default function FeaturedCategories() {
  const [failedImages, setFailedImages] = useState(() => new Set());

  return (
    <section className="categories-section page-shell" id="categories">
      <div className="section-heading">
        <div>
          <span className="eyebrow">A PLACE FOR EVERY CHAPTER</span>
          <h2>What does <em>home</em> look like to you?</h2>
        </div>
        <a className="text-link" href="#services">Explore all places <span aria-hidden="true">↗</span></a>
      </div>
      <div className="category-grid">
        {categories.map((category) => (
          <Link
            className={`category-card ${category.className || ""}`}
            to={category.path}
            key={category.title}
          >
            {failedImages.has(category.title) ? (
              <span className="category-image-fallback" role="img" aria-label={`${category.title} photo unavailable`}>
                Photo temporarily unavailable
              </span>
            ) : (
              <img
                className="category-image"
                src={category.image}
                alt={category.imageAlt}
                onError={() => {
                  setFailedImages((current) => new Set(current).add(category.title));
                }}
              />
            )}
            <span className="category-topline">{category.count}<span aria-hidden="true">↗</span></span>
            <span className="category-copy">
              <span>{category.subtitle}</span>
              <strong>{category.title}</strong>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
