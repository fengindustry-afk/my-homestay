import { BUSINESS } from "@/lib/site";

// Absolute so they also work from pages other than the homepage.
const QUICK_LINKS = [
    ["/#home", "Home"],
    ["/#rooms", "Our Homestays"],
    ["/#amenities", "Amenities"],
    ["/#gallery", "Gallery"],
    ["/#contact", "Contact"],
] as const;

const HOMESTAY_TYPES = ["Bungalow Unit", "Studio Unit", "Family Room", "Holiday Home", "Tiny House", "Event Hall"];

export default function Footer() {
    const { address } = BUSINESS;
    return (
        <footer className="footer">
            <div className="wrap">
                <div className="footer-grid">
                    {/* Explore */}
                    <div>
                        <h4 className="footer-title">Quick Links</h4>
                        {QUICK_LINKS.map(([href, label]) => (
                            // Plain <a>, not next/link: Lenis smooth-scrolls same-page anchors with the navbar offset.
                            <a key={href} href={href} className="footer-link">{label}</a>
                        ))}
                    </div>

                    {/* Brand, centred */}
                    <div className="footer-brand">
                        <div className="footer-emblem" aria-hidden="true">I</div>
                        <span className="footer-wordmark">{BUSINESS.name}</span>
                        <p className="footer-tagline">
                            Your home away from home. Experience luxury, comfort, and Malaysian
                            hospitality at its <a href="/finest-touch" style={{ textDecoration: "none", color: "inherit" }}>finest</a>.
                        </p>
                    </div>

                    {/* Contact */}
                    <div className="footer-contact">
                        <h4 className="footer-title">Contact Info</h4>
                        <p>
                            {address.street}<br />
                            {address.locality} {address.postalCode},<br />
                            {address.region}
                        </p>
                        <p>
                            {BUSINESS.phones.map((p) => (
                                <span key={p}>{p}<br /></span>
                            ))}
                            {BUSINESS.email}
                        </p>
                    </div>
                </div>

                <div className="footer-types">
                    <h4 className="footer-title">Homestay Types</h4>
                    <ul className="footer-type-list">
                        {HOMESTAY_TYPES.map((r) => (
                            <li key={r} className="footer-type">{r}</li>
                        ))}
                    </ul>
                </div>

                <div className="footer-bottom">
                    <span>&copy; 2026 {BUSINESS.name}. All rights reserved.</span>
                    <div className="footer-social">
                        <a href="https://facebook.com/indahmoribhomestay" target="_blank" rel="noopener noreferrer" aria-label="Facebook">Facebook</a>
                        {/*<a href="https://instagram.com/indahmoribhomestay" target="_blank" rel="noopener noreferrer" aria-label="Instagram">Ig</a>
                        //<a href="https://x.com/indahmorib" target="_blank" rel="noopener noreferrer" aria-label="X">X</a>
                        //<a href="https://youtube.com/@indahmoribhomestay" target="_blank" rel="noopener noreferrer" aria-label="YouTube">Yt</a>
                        */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
