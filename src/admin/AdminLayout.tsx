import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV: { to: string; label: string }[] = [
  { to: "/admin", label: "Tableau de bord" },
  { to: "/admin/formations", label: "Formations" },
  { to: "/admin/categories", label: "Catégories" },
  { to: "/admin/instructors", label: "Formateurs" },
  { to: "/admin/testimonials", label: "Témoignages" },
  { to: "/admin/navigation", label: "Navigation" },
  { to: "/admin/media", label: "Médias" },
  { to: "/admin/quizzes", label: "Quiz" },
  { to: "/admin/projects", label: "Projets" },
  { to: "/admin/students", label: "Étudiants" },
  { to: "/admin/certificates", label: "Certificats" },
  { to: "/admin/blog", label: "Blog" },
  { to: "/admin/faq", label: "FAQ" },
  { to: "/admin/help", label: "Aide" },
  { to: "/admin/pages", label: "Pages du site" },
  { to: "/admin/settings", label: "Paramètres" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">TA <b>Admin</b></div>
        <nav>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === "/admin"} className={({ isActive }) => (isActive ? "admin-nav-active" : "")}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-user">
          {profile?.full_name || "Admin"}
          <a className="btn btn-ghost" href="/">← Voir le site</a>
          <button className="btn btn-ghost" onClick={() => signOut()}>Déconnexion</button>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
