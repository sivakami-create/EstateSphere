import { Link } from "react-router-dom";

export default function Breadcrumbs({ items }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        <li><Link to="/">Home</Link></li>
        {items.map((item, index) => (
          <li key={item.label}>
            <span className="breadcrumb-separator" aria-hidden="true">/</span>
            {item.to && index < items.length - 1
              ? <Link to={item.to}>{item.label}</Link>
              : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
