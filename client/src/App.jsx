import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/Header.jsx";
import HeroSection from "./components/HeroSection.jsx";
import FeaturedCategories from "./components/FeaturedCategories.jsx";
import Footer from "./components/Footer.jsx";
import ListingPage from "./pages/ListingPage.jsx";
import PropertyDetailsPage from "./pages/PropertyDetailsPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import RoleLandingPage from "./pages/RoleLandingPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PropertyManagementPage from "./pages/PropertyManagementPage.jsx";
import PropertyManagementAccess from "./components/PropertyManagementAccess.jsx";
import AdminReviewAccess from "./components/AdminReviewAccess.jsx";
import AdminPropertyReviewPage from "./pages/AdminPropertyReviewPage.jsx";
import PropertyRequestsPage from "./pages/PropertyRequestsPage.jsx";
import NavigationDestinationPage from "./pages/NavigationDestinationPage.jsx";

function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeaturedCategories />
      <section className="service-note page-shell" id="about">
        <span className="service-note-icon" aria-hidden="true">✳</span>
        <div>
          <span className="eyebrow">MORE THAN A LISTING</span>
          <h2>A little more confidence in every move.</h2>
          <p>EstateSphere brings accommodation, rentals and homes together in one welcoming place—so your next move can feel a little more like yours.</p>
        </div>
        <a href="#services" className="service-note-link">Get to know us <span aria-hidden="true">↗</span></a>
      </section>
    </main>
  );
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() => document.querySelector(hash)?.scrollIntoView());
      return;
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<ListingPage searchMode />} />
        <Route path="/listings/:categorySlug" element={<ListingPage />} />
        <Route path="/explore/:destinationId" element={<NavigationDestinationPage />} />
        <Route path="/properties/:propertyId" element={<PropertyDetailsPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/tenant" element={<RoleLandingPage role="tenant" />} />
          <Route path="/tenant/requests" element={<PropertyRequestsPage audience="tenant" />} />
          <Route path="/owner" element={<RoleLandingPage role="owner" />} />
          <Route path="/pg-operator" element={<RoleLandingPage role="pg_operator" />} />
          <Route path="/admin" element={<RoleLandingPage role="admin" />} />
          <Route element={<AdminReviewAccess />}>
            <Route path="/admin/properties" element={<AdminPropertyReviewPage />} />
          </Route>
          <Route element={<PropertyManagementAccess />}>
            <Route path="/owner/requests" element={<PropertyRequestsPage audience="owner" />} />
            <Route path="/pg-operator/requests" element={<PropertyRequestsPage audience="owner" />} />
            <Route path="/owner/properties" element={<PropertyManagementPage mode="list" />} />
            <Route path="/owner/properties/new" element={<PropertyManagementPage mode="new" />} />
            <Route path="/owner/properties/:propertyId" element={<PropertyManagementPage mode="details" />} />
            <Route path="/owner/properties/:propertyId/edit" element={<PropertyManagementPage mode="edit" />} />
            <Route path="/pg-operator/properties" element={<PropertyManagementPage mode="list" />} />
            <Route path="/pg-operator/properties/new" element={<PropertyManagementPage mode="new" />} />
            <Route path="/pg-operator/properties/:propertyId" element={<PropertyManagementPage mode="details" />} />
            <Route path="/pg-operator/properties/:propertyId/edit" element={<PropertyManagementPage mode="edit" />} />
          </Route>
        </Route>
        <Route path="*" element={<ListingPage />} />
      </Routes>
      <Footer />
    </>
  );
}
