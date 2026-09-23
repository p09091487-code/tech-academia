import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import NotificationsBell from "../components/NotificationsBell";

const DEFAULT_HEADER = [
  { label: "Formations", url: "/formations" }, { label: "À propos", url: "/a-propos" },
  { label: "Blog", url: "/blog" }, { label: "FAQ", url: "/faq" }, { label: "Contact", url: "/contact" },
];
const DEFAULT_FOOTER = [
  { label: "Toutes les formations", url: "/formations" }, { label: "Blog", url: "/blog" },
  { label: "Certificats", url: "/certificats" }, { label: "Aide", url: "/aide" },
];

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { session, profile, signOut } = useAuth();
  const [headerLinks, setHeaderLinks] = useState(DEFAULT_HEADER);
  const [footerLinks, setFooterLinks] = useState(DEFAULT_FOOTER);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => { (async () => {
    const { data: nav } = await supabase.from("site_navigation").select("*").order("position");
    const header = (nav ?? []).filter((n: any) => n.zone === "header");
    const footer = (nav ?? []).filter((n: any) => n.zone === "footer");
    if (header.length) setHeaderLinks(header);
    if (footer.length) setFooterLinks(footer);
    const { data: s } = await supabase.from("site_settings").select("*");
    const map: Record<string, string> = {};
    (s ?? []).forEach((r: any) => { map[r.key] = r.value?.text ?? ""; });
    setSettings(map);
  })(); }, []);

  return (
    <div className="app-shell">
      <header className="header">
        <Link className="brand" to="/"><span className="brand-mark"><Sparkles size={18} /></span>TECH <b>ACADEMIA</b></Link>
        <nav>{headerLinks.map((l) => <Link key={l.url} to={l.url}>{l.label}</Link>)}</nav>
        <div className="header-actions">
          {session ? (
            <>
              <NotificationsBell />
              <Link className="btn btn-ghost" to="/dashboard">{profile?.full_name || "Mon espace"}</Link>
              <button className="btn btn-primary" onClick={() => signOut()}>Déconnexion</button>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost" to="/connexion">Connexion</Link>
              <Link className="btn btn-primary" to="/inscription">Commencer</Link>
            </>
          )}
        </div>
      </header>
      <main>{children}</main>
      <footer className="footer">
        <div><div className="brand">TECH <b>ACADEMIA</b></div><p>{settings.footer_tagline || "Apprenez. Créez. Progressez."}</p></div>
        <div><h4>Liens</h4>{footerLinks.map((l) => <Link key={l.url} to={l.url}>{l.label}</Link>)}</div>
        <div><h4>Légal</h4><Link to="/conditions">Conditions</Link><Link to="/confidentialite">Confidentialité</Link><Link to="/mentions-legales">Mentions légales</Link></div>
        <div><h4>Contact</h4>{settings.contact_email && <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>}{settings.contact_phone && <span>{settings.contact_phone}</span>}</div>
        <div style={{ gridColumn: "1/-1", fontSize: 12, color: "#94a3b8", marginTop: 12 }}>{settings.footer_copyright || `© ${new Date().getFullYear()} TECH ACADEMIA`}</div>
      </footer>
    </div>
  );
}
