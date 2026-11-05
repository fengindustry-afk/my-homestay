import { useTranslations } from "next-intl";
import { BUSINESS } from "@/lib/site";
import { Link } from "@/i18n/navigation";
import LocaleSwitch from "./LocaleSwitch";

// Absolute so they also work from pages other than the homepage.
const QUICK_LINKS = ["home", "rooms", "amenities", "gallery", "contact"] as const;

const HOMESTAY_TYPES = ["typeBungalow", "typeStudio", "typeFamily", "typeHoliday", "typeTiny", "typeHall"] as const;

export default function Footer() {
    const { address } = BUSINESS;
    const t = useTranslations("Footer");
    const tNav = useTranslations("Nav");
    const tSearch = useTranslations("Search");
    const tLanding = useTranslations("Landing");
    // "/" or "/en/", so the links stay in the visitor's language.
    const home = t("homePath");
    return (
        <footer className="footer">
            <div className="wrap">
                <div className="footer-grid">
                    {/* Explore */}
                    <div>
                        <h4 className="footer-title">{t("quickLinks")}</h4>
                        {QUICK_LINKS.map((k) => (
                            // Plain <a>, not next/link: Lenis smooth-scrolls same-page anchors with the navbar offset.
                            <a key={k} href={`${home}#${k}`} className="footer-link">{k === "rooms" ? t("ourRooms") : tNav(k)}</a>
                        ))}
                        <Link href="/family-day" className="footer-link">{tLanding("familyDay.nav")}</Link>
                        <Link href="/dewan-majlis-banting" className="footer-link">{tLanding("hall.nav")}</Link>
                    </div>

                    {/* Brand, centred */}
                    <div className="footer-brand">
                        <div className="footer-emblem" aria-hidden="true">I</div>
                        <span className="footer-wordmark">{BUSINESS.name}</span>
                        <p className="footer-tagline">
                            {t.rich("tagline", {
                                admin: (c) => <a href="/finest-touch" style={{ textDecoration: "none", color: "inherit" }}>{c}</a>,
                            })}
                        </p>
                    </div>

                    {/* Contact */}
                    <div className="footer-contact">
                        <h4 className="footer-title">{t("contactInfo")}</h4>
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
                    <h4 className="footer-title">{t("types")}</h4>
                    <ul className="footer-type-list">
                        {HOMESTAY_TYPES.map((r) => (
                            <li key={r} className="footer-type">{tSearch(r)}</li>
                        ))}
                    </ul>
                </div>

                <div className="footer-bottom">
                    <span>{t("rights", { name: BUSINESS.name })}</span>
                    <LocaleSwitch className="footer-locale" />
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
