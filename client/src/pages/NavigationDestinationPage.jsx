import { Link, useParams } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import {
  getNavigationDestinationAction,
  navigationDestinationById,
} from "../data/navigationDestinations.js";

export default function NavigationDestinationPage() {
  const { destinationId } = useParams();
  const destination = navigationDestinationById[destinationId];

  if (!destination) {
    return (
      <main className="page-shell navigation-destination-page">
        <span className="eyebrow">PAGE NOT FOUND</span>
        <h1>This destination is not available.</h1>
        <p>Choose an option from the EstateSphere navigation to continue.</p>
        <Link className="solid-link" to="/">Return to EstateSphere</Link>
      </main>
    );
  }

  const action = getNavigationDestinationAction(destination);

  return (
    <main className="page-shell navigation-destination-page">
      <Breadcrumbs items={[
        { label: destination.menuLabel, to: "/" },
        { label: destination.categoryLabel, to: "/" },
        { label: destination.label },
      ]} />
      <header className="navigation-destination-heading">
        <span className="eyebrow">{destination.menuLabel} · {destination.categoryLabel}</span>
        <h1>{destination.label}</h1>
        <p>{destination.guide.intro}</p>
      </header>

      <section className="navigation-destination-content" aria-labelledby="destination-guidance-heading">
        <div>
          <span className="eyebrow">A HELPFUL PLACE TO START</span>
          <h2 id="destination-guidance-heading">Things to keep in mind</h2>
          <ul>
            {destination.guide.points.map((point) => <li key={point}>{point}</li>)}
          </ul>
        </div>
        <aside className="navigation-destination-action">
          <span className="eyebrow">CONTINUE YOUR SEARCH</span>
          <h2>{destination.categoryLabel}</h2>
          <p>
            {destination.menuLabel === "My EstateSphere"
              ? "Some account features require sign-in, and features not currently implemented are identified above."
              : "Use the existing EstateSphere pages and filters to explore the information currently available."}
          </p>
          <Link className="solid-link" to={action.to}>
            {action.label}<span aria-hidden="true"> ↗</span>
          </Link>
        </aside>
      </section>

      <p className="navigation-destination-note">
        EstateSphere is a college project portal. Information here is guidance only; verify property details independently. Demonstration listings are fictional and are not real offers.
      </p>
    </main>
  );
}
