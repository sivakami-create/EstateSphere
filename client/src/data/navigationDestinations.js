import { navigation } from "./navigation.js";

const destinationGuides = {
  "Accommodation|Girls PG": {
    intro: "Compare girls' paying guest accommodation using the listing details available on EstateSphere. Demonstration records are fictional and are not verified offers.",
    points: ["Review the room, furnishing and listed facilities.", "Use the listing filters to narrow options by state, city and locality.", "Confirm safety arrangements and terms directly before making any real-world decision."],
  },
  "Accommodation|Boys PG": {
    intro: "Explore boys' paying guest options and the room and facility details shown on each listing. Demonstration records are fictional and are not verified offers.",
    points: ["Compare the advertised room type and included facilities.", "Refine the nationwide results by state, city and locality.", "Confirm house rules, costs and arrangements directly before making any real-world decision."],
  },
  "Accommodation|Student accommodation": {
    intro: "A practical starting point for students comparing rooms and shared stays around their place of study.",
    points: ["Consider commute time and transport options to campus.", "Check whether furnishings and everyday essentials are listed.", "Review the listing location and monthly price before comparing options."],
  },
  "Accommodation|Co-living": {
    intro: "Use the available shared-stay listings to explore room arrangements and locations that may suit a co-living search.",
    points: ["Check whether a listing describes a private room or shared space.", "Compare monthly costs and the facilities actually listed.", "Confirm occupancy, house rules and availability with the advertiser."],
  },
  "Accommodation|PG facilities": {
    intro: "Compare the facilities explicitly named in PG listings; EstateSphere does not independently certify amenities.",
    points: ["Look for specific details such as meals, Wi-Fi or laundry.", "Treat unlisted facilities as unconfirmed and ask before making plans.", "Use the accommodation filters to compare available PG categories."],
  },
  "Rental Properties|1 RK & 1 BHK": {
    intro: "Browse compact rental homes and compare their listed location, monthly rent and furnishing.",
    points: ["Choose between a single-room kitchen layout and a one-bedroom home.", "Compare rent and deposit details shown on each listing.", "Narrow results by State, City and Locality on the listing page."],
  },
  "Rental Properties|2 BHK & 3 BHK": {
    intro: "Explore larger rental homes with multiple bedrooms and compare the details available in each listing.",
    points: ["Compare bedroom count, furnishing and listed amenities.", "Consider commute, household needs and the stated monthly rent.", "Use location filters to focus on a specific State, City or Locality."],
  },
  "Rental Properties|Shared flats": {
    intro: "Find shared-flat listings and review the room, location and monthly cost details provided.",
    points: ["Check whether the listing describes a private room or shared occupancy.", "Confirm roommate arrangements, utilities and house rules directly.", "Filter the results by location and available property details."],
  },
  "Rental Properties|Independent houses": {
    intro: "Compare independent rental homes using the location, room, furnishing and amenity information shown.",
    points: ["Review the home's layout and any outdoor space actually described.", "Compare monthly rent and deposit details.", "Confirm maintenance responsibilities and availability directly."],
  },
  "Rental Properties|Premium rentals": {
    intro: "Explore rental listings using your own criteria for location, space and furnishing. EstateSphere does not certify a premium or luxury standard.",
    points: ["Evaluate the specific amenities and finishes stated in each listing.", "Compare monthly rent against your own budget.", "Use detailed search filters; there is no separate premium verification or service."],
  },
  "Buy & Sell|Property discovery": {
    intro: "Start a sale-property search and refine it using location, total purchase budget and supported property types.",
    points: ["Sale results are limited to public listings that meet the existing visibility rules.", "Demonstration listings are labelled and are not verified offers.", "No sale listings may be available in some locations or categories."],
  },
  "Buy & Sell|Residential properties": {
    intro: "Explore residential sale listings where available; EstateSphere does not provide project verification or transaction services.",
    points: ["Compare asking prices, property types and locations.", "Use purchase-budget filters based on total price, not monthly rent.", "Check listing status and independently verify all details."],
  },
  "Buy & Sell|Commercial properties": {
    intro: "Use the sale search to see publicly visible listings and refine by supported property type and location.",
    points: ["Commercial sale inventory may be limited; the search does not fabricate results.", "Review the asking price and location details provided.", "Independently verify zoning, permitted use and any investment claims."],
  },
  "Buy & Sell|Selling & listing": {
    intro: "Owner accounts can submit listings for review. New user listings are subject to administrator approval before public visibility.",
    points: ["Prepare accurate property, location and pricing information.", "Use clear images you have the right to publish.", "Do not represent a submitted or pending listing as publicly approved."],
  },
  "Buy & Sell|Buyer resources": {
    intro: "Use these prompts to structure an independent property search. EstateSphere does not provide legal, lending or transaction advice.",
    points: ["Set a total purchase budget and account for costs beyond the asking price.", "Check property documents and claims with qualified professionals.", "Ask about title, condition, approvals and transaction terms before proceeding."],
  },
  "Our Services|Company information": {
    intro: "EstateSphere is a college project portal for exploring accommodation, rental and property information.",
    points: ["Browse public listings and use the available location filters.", "Demonstration records are fictional and are marked as such.", "The portal does not certify listings or act as a property broker."],
  },
  "Our Services|Tenant assistance": {
    intro: "Use the nationwide listing pages and their filters to organize a rental or accommodation search.",
    points: ["Compare location, monthly costs and details stated in each listing.", "Enquiries and visit requests are available only for eligible approved user listings.", "Demonstration properties cannot be contacted or visited."],
  },
  "Our Services|Owner assistance": {
    intro: "EstateSphere provides an owner workspace for submitting and managing listings, with administrator review and request tools for eligible listings.",
    points: ["Keep listing details accurate and current.", "A material edit to an approved listing returns it for review.", "Demo records are not owner submissions and cannot receive real enquiries."],
  },
  "Our Services|Locality guides": {
    intro: "Use the location filters to browse the cities and localities represented in the EstateSphere catalog.",
    points: ["Location options come from the portal's India location catalog.", "Locality examples may be curated and are not exhaustive.", "Results appear only where matching public listings exist."],
  },
  "Our Services|Support": {
    intro: "For help with this college project portal, contact the EstateSphere team. Do not send passwords or other sensitive account credentials.",
    points: ["Include the page or listing reference when reporting a problem.", "Do not treat this support contact as an emergency or transaction service.", "Use the account security guidance for general safety reminders."],
  },
  "My EstateSphere|Account access": {
    intro: "EstateSphere supports tenant, owner and PG operator registration, plus sign-in to existing accounts. Public administrator registration is not available.",
    points: ["Use a unique password and keep it private.", "Choose the role that accurately describes how you use the portal.", "Account profile editing beyond the implemented account flows is not currently available."],
  },
  "My EstateSphere|Saved properties": {
    intro: "Saved-property lists, saved searches and property comparison are not currently implemented in EstateSphere.",
    points: ["You can browse listings and open their detail pages.", "Use your browser's own bookmarking feature if you want to revisit a page.", "No saved-property data is collected or maintained by this portal."],
  },
  "My EstateSphere|Enquiries": {
    intro: "Tenants can review requests they have submitted for eligible approved user listings. Requests are not bookings or confirmations.",
    points: ["Demo properties do not accept real enquiries or visit requests.", "Owners and PG operators can respond only to requests about their own approved listings.", "Sign in as a tenant to open the request workspace."],
  },
  "My EstateSphere|Owner workspace": {
    intro: "Owners and PG operators can manage their own submitted listings and review relevant requests after signing in.",
    points: ["New listings remain pending until administrator review.", "Approved listing edits may require another review.", "The workspace enforces role and property ownership permissions."],
  },
  "My EstateSphere|Help & security": {
    intro: "Use EstateSphere carefully and verify property details independently. This portal does not guarantee listing accuracy or provide emergency assistance.",
    points: ["Never share your password or one-time codes with another person.", "Be cautious of requests to transfer money outside a verified process.", "Report suspicious listing concerns with a page reference; do not include sensitive data."],
  },
};

function slugify(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const navigationDestinations = navigation.flatMap((menu) =>
  menu.categories.flatMap((category) => {
    const guide = destinationGuides[`${menu.label}|${category.label}`];
    return category.destinations.map((label) => ({
      id: slugify(label),
      label,
      menuLabel: menu.label,
      categoryLabel: category.label,
      categoryPath: category.path ?? "",
      guide,
    }));
  }),
);

export const navigationDestinationById = Object.fromEntries(
  navigationDestinations.map((destination) => [destination.id, destination]),
);

export function getNavigationDestinationPath(label) {
  return `/explore/${slugify(label)}`;
}

export function getNavigationDestinationAction(destination) {
  if (destination.menuLabel === "My EstateSphere") {
    if (destination.categoryLabel === "Account access") {
      return destination.label.toLowerCase().startsWith("create")
        ? { label: "Create an account", to: "/register" }
        : { label: "Sign in", to: "/login" };
    }
    if (destination.categoryLabel === "Enquiries") {
      return { label: "Open My Enquiries & Visits", to: "/tenant/requests" };
    }
    if (destination.categoryLabel === "Owner workspace") {
      return { label: "Open owner workspace", to: "/owner" };
    }
    return { label: "Browse available listings", to: "/search?mode=all" };
  }

  if (destination.menuLabel === "Our Services") {
    if (destination.categoryLabel === "Support") {
      const subject = encodeURIComponent(destination.label);
      return { label: "Contact the EstateSphere team", to: `mailto:hello@estatesphere.in?subject=${subject}` };
    }
    if (destination.categoryLabel === "Owner assistance") {
      return { label: "Create an owner account", to: "/register" };
    }
    if (destination.categoryLabel === "Company information") {
      return { label: "Explore the homepage", to: "/" };
    }
    return { label: "Browse homes and stays", to: "/search?mode=all" };
  }

  if (destination.menuLabel === "Buy & Sell") {
    if (destination.categoryLabel === "Selling & listing") {
      return { label: "Create an owner account", to: "/register" };
    }
    return { label: "Browse properties for sale", to: "/search?mode=buy" };
  }

  if (destination.menuLabel === "Accommodation") {
    return destination.categoryPath
      ? { label: `Browse ${destination.categoryLabel}`, to: destination.categoryPath }
      : { label: "Browse PG & shared stays", to: "/search?mode=pg" };
  }

  return destination.categoryPath
    ? { label: `Browse ${destination.categoryLabel}`, to: destination.categoryPath }
    : { label: "Browse rental homes", to: "/search?mode=rent" };
}
