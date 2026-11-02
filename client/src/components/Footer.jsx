import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer" id="services">
      <div className="footer-main page-shell">
        <div className="footer-brand-block">
          <Link className="brand footer-brand" to="/">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 40 40">
                <path d="M5 18.5 20 6l15 12.5v15H5z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
                <path d="M15 33.5v-11h10v11M12 17h.01M28 17h.01" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="brand-name">Estate<span>Sphere</span><small>LIVE WELL. FIND HOME.</small></span>
          </Link>
          <p>Thoughtful places. Better beginnings.<br />A little closer to feeling at home.</p>
        </div>
        <div className="footer-column">
          <h3>Explore</h3>
          <Link to="/#categories">Accommodation</Link>
          <Link to="/#categories">Rental properties</Link>
          <Link to="/#categories">Buy & sell</Link>
        </div>
        <div className="footer-column">
          <h3>EstateSphere</h3>
          <Link to="/#services">About us</Link>
          <Link to="/#services">Our services</Link>
          <a href="mailto:hello@estatesphere.in">Contact us</a>
        </div>
        <div className="footer-newsletter">
          <span className="eyebrow">A note from home</span>
          <h3>Good places.<br />Good things ahead.</h3>
          <a className="footer-contact" href="mailto:hello@estatesphere.in">hello@estatesphere.in <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <div className="footer-bottom page-shell">
        <span>© {new Date().getFullYear()} EstateSphere. Made for better living.</span>
        <span>Thoughtfully connecting people and places.</span>
      </div>
    </footer>
  );
}
