export const listingCategories = [
  {
    slug: "girls-pg",
    label: "Girls PG",
    path: "/listings/girls-pg",
    heading: "Girls PG Accommodation Across India",
    locationHeading: "Girls PG Accommodation in {location}",
    description: "Explore sample girls PG stays with room, furnishing and amenity information in one place.",
    breadcrumb: "Girls PG",
  },
  {
    slug: "boys-pg",
    label: "Boys PG",
    path: "/listings/boys-pg",
    heading: "Boys PG Accommodation Across India",
    locationHeading: "Boys PG Accommodation in {location}",
    description: "Browse sample boys PG stays and compare location, monthly rent and facilities.",
    breadcrumb: "Boys PG",
  },
  {
    slug: "shared-flats",
    label: "Shared Flats",
    path: "/listings/shared-flats",
    heading: "Shared Flats Across India",
    locationHeading: "Shared Flats in {location}",
    description: "Find sample shared-flat rooms with practical details for students and working residents.",
    breadcrumb: "Shared Flats",
  },
  {
    slug: "1rk-1bhk",
    label: "1 RK & 1 BHK",
    path: "/listings/1rk-1bhk",
    heading: "1RK & 1BHK Rentals Across India",
    locationHeading: "1RK & 1BHK Rentals in {location}",
    description: "Compare sample compact rental homes by neighbourhood, monthly rent and furnishing.",
    breadcrumb: "1 RK & 1 BHK",
  },
  {
    slug: "2bhk-3bhk",
    label: "2 BHK & 3 BHK",
    path: "/listings/2bhk-3bhk",
    heading: "2BHK & 3BHK Rentals Across India",
    locationHeading: "2BHK & 3BHK Rentals in {location}",
    description: "Explore sample multi-bedroom rental homes with room, pricing and amenity information.",
    breadcrumb: "2 BHK & 3 BHK",
  },
  {
    slug: "independent-houses",
    label: "Independent Houses",
    path: "/listings/independent-houses",
    heading: "Independent Houses Across India",
    locationHeading: "Independent Houses in {location}",
    description: "Discover sample independent rental homes and compare their location, price and features.",
    breadcrumb: "Independent Houses",
  },
];

export const listingCategoryBySlug = Object.fromEntries(
  listingCategories.map((category) => [category.slug, category]),
);

export function getCategoryHeading(category, location) {
  const selectedLocation = [location.locality, location.city, location.state].filter(Boolean).join(", ");
  return selectedLocation
    ? category.locationHeading.replace("{location}", selectedLocation)
    : category.heading;
}
