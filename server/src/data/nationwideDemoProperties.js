import { indiaLocations } from "./indiaLocations.js";

const categoryTemplates = [
  {
    category: "girls-pg",
    label: "Girls PG accommodation",
    propertyType: "Single-occupancy PG",
    bedrooms: "Private room",
    accommodation: "Fictional girls' PG example · single occupancy · shared common areas",
    furnishing: "Fully furnished",
    rent: 8200,
    amenities: ["Wi-Fi", "Housekeeping", "Study space"],
    image: "/images/girls-pg.jpg",
  },
  {
    category: "boys-pg",
    label: "Boys PG accommodation",
    propertyType: "Shared-occupancy PG",
    bedrooms: "Twin-sharing room",
    accommodation: "Fictional boys' PG example · twin sharing · common dining area",
    furnishing: "Furnished",
    rent: 7600,
    amenities: ["Wi-Fi", "Common dining", "Water purifier"],
    image: "/images/boys-pg.jpg",
  },
  {
    category: "shared-flats",
    label: "Shared flat",
    propertyType: "Private room in shared flat",
    bedrooms: "Private bedroom",
    accommodation: "Fictional shared apartment example · private bedroom · shared kitchen and lounge",
    furnishing: "Furnished",
    rent: 9500,
    amenities: ["Kitchen access", "Washing machine", "Balcony"],
    image: "/images/flats-apartments.jpg",
  },
  {
    category: "1rk-1bhk",
    label: "1 RK / 1 BHK rental",
    propertyType: "1 BHK apartment",
    bedrooms: "1 bedroom",
    accommodation: "Fictional apartment example · one bedroom · private bathroom",
    furnishing: "Semi-furnished",
    rent: 11500,
    amenities: ["24-hour water", "Security", "Nearby public transport"],
    image: "/images/flats-apartments.jpg",
  },
  {
    category: "2bhk-3bhk",
    label: "2 BHK / 3 BHK rental",
    propertyType: "2 BHK apartment",
    bedrooms: "2 bedrooms",
    accommodation: "Fictional apartment example · two bedrooms · shared living area",
    furnishing: "Semi-furnished",
    rent: 20500,
    amenities: ["Lift", "Balcony", "Covered parking"],
    image: "/images/flats-apartments.jpg",
  },
  {
    category: "independent-houses",
    label: "Independent house rental",
    propertyType: "2 BHK independent house",
    bedrooms: "2 bedrooms",
    accommodation: "Fictional independent house example · private entrance · outdoor space",
    furnishing: "Unfurnished",
    rent: 24500,
    amenities: ["Private entrance", "Outdoor space", "24-hour water"],
    image: "/images/house-rentals.jpg",
  },
];

function slug(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const nationwideDemoProperties = indiaLocations.flatMap((stateEntry, stateIndex) => (
  categoryTemplates.map((template, categoryIndex) => {
    const cityEntry = stateEntry.cities[0];
    const locality = cityEntry.localities.length
      ? cityEntry.localities[categoryIndex % cityEntry.localities.length]
      : "";
    const location = {
      state: stateEntry.name,
      city: cityEntry.name,
      locality,
    };
    const areaLabel = locality || cityEntry.name;
    const monthlyRent = template.rent + (stateIndex % 5) * 650 + categoryIndex * 275;

    return {
      _id: `demo-${slug(stateEntry.name)}-${template.category}`,
      title: `Sample ${template.label} in ${areaLabel}`,
      description: `Fictional demonstration listing for ${template.label.toLowerCase()} in ${areaLabel}, ${cityEntry.name}. This example is provided for academic project presentation and does not represent a verified property or accommodation offer.`,
      category: template.category,
      propertyType: template.propertyType,
      location: locality ? `${locality}, ${cityEntry.name}` : cityEntry.name,
      ...location,
      address: `Fictional demonstration address, ${areaLabel}, ${cityEntry.name}`,
      monthlyRent,
      securityDeposit: monthlyRent * 2,
      furnishing: template.furnishing,
      amenities: [...template.amenities],
      images: [template.image],
      availability: "available",
      listingStatus: "demo",
      bedrooms: template.bedrooms,
      accommodation: template.accommodation,
      isDemo: true,
      transactionType: "rent",
    };
  })
));
