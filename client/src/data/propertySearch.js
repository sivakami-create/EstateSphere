export const propertySearchModes = {
  all: {
    label: "Homes & stays",
    heading: "Homes & accommodation across India",
    locationHeading: "Homes & accommodation in {location}",
    description: "Browse rental homes, shared flats and PG accommodation by location and monthly budget.",
    transactionType: "rent",
    categories: ["girls-pg", "boys-pg", "shared-flats", "1rk-1bhk", "2bhk-3bhk", "independent-houses"],
    propertyTypes: [
      { value: "girls-pg", label: "Girls PG", categories: ["girls-pg"] },
      { value: "boys-pg", label: "Boys PG", categories: ["boys-pg"] },
      { value: "shared-accommodation", label: "Shared Accommodation", categories: ["shared-flats"] },
      { value: "1rk", label: "1RK", categories: ["1rk-1bhk"], contains: "1 RK" },
      { value: "1bhk", label: "1BHK", categories: ["1rk-1bhk"], contains: "1 BHK" },
      { value: "2bhk", label: "2BHK", categories: ["2bhk-3bhk"], contains: "2 BHK" },
      { value: "3bhk", label: "3BHK", categories: ["2bhk-3bhk"], contains: "3 BHK" },
      { value: "independent-house", label: "Independent House", categories: ["independent-houses"], contains: "independent house" },
    ],
    budget: [
      { value: "", label: "Any monthly budget" },
      { value: "0-10000", label: "Up to ₹10,000 / month", max: 10000 },
      { value: "10000-20000", label: "₹10,000–₹20,000 / month", min: 10000, max: 20000 },
      { value: "20000-40000", label: "₹20,000–₹40,000 / month", min: 20000, max: 40000 },
      { value: "40000-75000", label: "₹40,000–₹75,000 / month", min: 40000, max: 75000 },
      { value: "75000+", label: "Above ₹75,000 / month", min: 75000 },
    ],
    filterBudget: [
      { value: 5000, label: "₹5,000" },
      { value: 10000, label: "₹10,000" },
      { value: 15000, label: "₹15,000" },
      { value: 20000, label: "₹20,000" },
      { value: 30000, label: "₹30,000" },
      { value: 50000, label: "₹50,000" },
      { value: 75000, label: "₹75,000" },
      { value: 100000, label: "₹1 lakh" },
    ],
  },
  rent: {
    label: "Rent",
    heading: "Rental homes across India",
    locationHeading: "Rental homes in {location}",
    description: "Browse rental listings and narrow your search by location, monthly budget and home type.",
    transactionType: "rent",
    categories: ["shared-flats", "1rk-1bhk", "2bhk-3bhk", "independent-houses"],
    propertyTypes: [
      { value: "1rk", label: "1RK", contains: "1 RK" },
      { value: "1bhk", label: "1BHK", contains: "1 BHK" },
      { value: "2bhk", label: "2BHK", contains: "2 BHK" },
      { value: "3bhk", label: "3BHK", contains: "3 BHK" },
      { value: "independent-house", label: "Independent House", contains: "independent house" },
      { value: "shared-flat", label: "Shared Flat", contains: "shared flat" },
    ],
    budget: [
      { value: 5000, label: "₹5,000" },
      { value: 10000, label: "₹10,000" },
      { value: 15000, label: "₹15,000" },
      { value: 20000, label: "₹20,000" },
      { value: 30000, label: "₹30,000" },
      { value: 50000, label: "₹50,000" },
      { value: 75000, label: "₹75,000" },
      { value: 100000, label: "₹1 lakh" },
    ],
  },
  buy: {
    label: "Buy",
    heading: "Properties for sale across India",
    locationHeading: "Properties for sale in {location}",
    description: "Explore homes for purchase and filter by location, total budget and property type.",
    transactionType: "sale",
    categories: ["residential-sale"],
    propertyTypes: [
      { value: "apartment", label: "Apartment", contains: "apartment" },
      { value: "independent-house", label: "Independent House", contains: "independent house" },
      { value: "plot", label: "Plot / Land", contains: "plot" },
      { value: "commercial", label: "Commercial property", contains: "commercial" },
      { value: "other", label: "Other supported property types", excludes: ["apartment", "independent house"] },
    ],
    budget: [
      { value: 1000000, label: "₹10 lakh" },
      { value: 2500000, label: "₹25 lakh" },
      { value: 5000000, label: "₹50 lakh" },
      { value: 7500000, label: "₹75 lakh" },
      { value: 10000000, label: "₹1 crore" },
      { value: 25000000, label: "₹2.5 crore" },
      { value: 50000000, label: "₹5 crore" },
      { value: 100000000, label: "₹10 crore" },
    ],
  },
  pg: {
    label: "PG / Stay",
    heading: "PG & shared accommodation across India",
    locationHeading: "PG & shared accommodation in {location}",
    description: "Find PG and shared stays with location and monthly accommodation budget filters.",
    transactionType: "rent",
    categories: ["girls-pg", "boys-pg", "shared-flats"],
    propertyTypes: [
      { value: "girls-pg", label: "Girls PG", categories: ["girls-pg"] },
      { value: "boys-pg", label: "Boys PG", categories: ["boys-pg"] },
      { value: "shared-accommodation", label: "Shared Accommodation", categories: ["shared-flats"] },
    ],
    budget: [
      { value: 5000, label: "₹5,000" },
      { value: 10000, label: "₹10,000" },
      { value: 15000, label: "₹15,000" },
      { value: 20000, label: "₹20,000" },
      { value: 30000, label: "₹30,000" },
      { value: 50000, label: "₹50,000" },
      { value: 75000, label: "₹75,000" },
      { value: 100000, label: "₹1 lakh" },
    ],
  },
};

export function getSearchPropertyFilters(modeKey, propertyType) {
  const mode = propertySearchModes[modeKey] ?? propertySearchModes.rent;
  const selectedType = mode.propertyTypes.find((type) => type.value === propertyType);
  return {
    transactionType: mode.transactionType,
    categories: selectedType?.categories ?? mode.categories,
    ...(selectedType?.matches ? { propertyTypes: selectedType.matches } : {}),
    ...(selectedType?.contains ? { propertyTypeContains: selectedType.contains } : {}),
    ...(selectedType?.excludes ? { propertyTypeExcludes: selectedType.excludes } : {}),
  };
}

export function getBudgetOptions(modeKey) {
  return propertySearchModes[modeKey]?.budget ?? propertySearchModes.rent.budget;
}
