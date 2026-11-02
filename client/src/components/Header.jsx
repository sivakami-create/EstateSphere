import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { navigation } from "../data/navigation.js";
import { getNavigationDestinationPath } from "../data/navigationDestinations.js";

function Chevron({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true">
      <path d="m5 7.5 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Header() {
  const headerRef = useRef(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const selectedMenu = navigation.find((item) => item.label === openMenu);
  const selectedCategory = selectedMenu?.categories.find((category) => category.label === activeCategory);

  const openMainMenu = (label) => {
    setOpenMenu(label);
    setActiveCategory(null);
    if (window.matchMedia("(max-width: 800px)").matches) {
      setMobileOpen(true);
    }
  };

  const toggleMainMenu = (label) => {
    if (openMenu === label) {
      setOpenMenu(null);
      setActiveCategory(null);
      return;
    }

    openMainMenu(label);
  };

  const handleMainMenuHover = (label) => {
    if (window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 801px)").matches && openMenu !== label) {
      openMainMenu(label);
    }
  };

  const toggleCategory = (label) => {
    setActiveCategory((current) => current === label ? null : label);
  };

  const goBack = () => {
    if (activeCategory) {
      setActiveCategory(null);
      return;
    }

    setOpenMenu(null);
    setActiveCategory(null);
  };

  useEffect(() => {
    if (!openMenu) return undefined;

    const handlePointerDown = (event) => {
      if (!headerRef.current?.contains(event.target)) {
        closeMenu();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenu]);

  const closeMenu = () => {
    setOpenMenu(null);
    setActiveCategory(null);
    setMobileOpen(false);
  };

  return (
    <header className="site-header" ref={headerRef}>
      <div className="topline">
        <div className="header-shell topline-inner">
          <span>Find a place to feel at home.</span>
          <Link to="/#services">A better way to find your next place <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      <div className="header-shell header-main">
        <Link className="brand" to="/" aria-label="EstateSphere home" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40">
              <path d="M5 18.5 20 6l15 12.5v15H5z" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
              <path d="M15 33.5v-11h10v11M12 17h.01M28 17h.01" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="brand-name">Estate<span>Sphere</span><small>LIVE WELL. FIND HOME.</small></span>
        </Link>

        <button
          className="mobile-menu-toggle"
          type="button"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          onClick={() => {
            if (mobileOpen) {
              closeMenu();
            } else {
              setMobileOpen(true);
            }
          }}
        >
          <span /><span /><span />
        </button>

        <nav className={`main-navigation${mobileOpen ? " is-mobile-open" : ""}${openMenu ? " is-menu-level" : ""}`} aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              className={`nav-trigger${openMenu === item.label ? " is-active" : ""}`}
              key={item.label}
              type="button"
              aria-expanded={openMenu === item.label}
              aria-controls={openMenu === item.label ? "estate-mega-menu" : undefined}
              onMouseEnter={() => handleMainMenuHover(item.label)}
              onClick={() => toggleMainMenu(item.label)}
            >
              {item.label}<Chevron />
            </button>
          ))}
        </nav>
        <Link className="header-cta" to="/#categories">Find a home <span aria-hidden="true">↗</span></Link>
      </div>

      {selectedMenu && (
        <div className="mega-menu-wrap">
          <section className="mega-menu" id="estate-mega-menu" aria-label={`${selectedMenu.label} menu`}>
            <div className="mega-heading">
              <button className="mega-back mega-back-main" type="button" onClick={goBack} aria-label="Back to main navigation">
                <span aria-hidden="true">‹</span><span>Main menu</span>
              </button>
              <span className="eyebrow">{selectedMenu.eyebrow}</span>
              <h2>{selectedMenu.label}</h2>
              <p>{selectedMenu.description}</p>
            </div>
            <div className="mega-content">
              <div className={`mega-categories${activeCategory ? " is-mobile-hidden" : ""}`} role="group" aria-label={`${selectedMenu.label} categories`}>
                {selectedMenu.categories.map((category, index) => (
                  <button
                    className={`mega-item${selectedCategory?.label === category.label ? " is-selected" : ""}`}
                    key={category.label}
                    id={`mega-category-${index}`}
                    type="button"
                    aria-controls="mega-destinations"
                    aria-expanded={activeCategory === category.label}
                    onClick={() => toggleCategory(category.label)}
                  >
                    {category.label}<span aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
              <div className={`mega-destinations${selectedCategory ? "" : " is-empty"}`} id="mega-destinations" aria-live="polite" aria-label={`${selectedCategory?.label ?? "Category"} destinations`}>
                {selectedCategory ? (
                  <>
                    <button className="mega-back mega-back-destinations" type="button" onClick={goBack} aria-label={`Back to ${selectedMenu.label} categories`}>
                      <span aria-hidden="true">‹</span><span>Categories</span>
                    </button>
                    <span className="eyebrow">{selectedCategory.label}</span>
                    <ul>
                      {selectedCategory.destinations.map((destination) => (
                        <li key={destination}>
                          <Link to={getNavigationDestinationPath(destination)} onClick={closeMenu}>{destination}<span aria-hidden="true">↗</span></Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="mega-hint">Choose a category to explore its options.</p>
                )}
              </div>
            </div>
            <button className="mega-close" type="button" aria-label="Close mega-menu" onClick={closeMenu}>×</button>
          </section>
        </div>
      )}
    </header>
  );
}
