import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminHome() {
  const { profile, signOut } = useAuth();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">TA <b>Admin</b></div>
        <nav>
          <span className="admin-nav-active">Tableau de bord</span>
          <span>Formations</span>
          <span>Cours</span>
          <span>Quiz</span>
          <span>Étudiants</span>
          <span>Formateurs</span>
          <span>Projets</span>
          <span>Certificats</span>
          <span>Blog</span>
          <span>FAQ / Aide</span>
          <span>Pages du site</span>
          <span>Médias</span>
        </nav>
        <div className="admin-user">
          {profile?.full_name || "Admin"}
          <button className="btn btn-ghost" onClick={() => signOut()}>Déconnexion</button>
        </div>
      </aside>
      <main className="admin-main">
        <h1>Tableau de bord</h1>
        <p>
          Connexion admin validée (rôle <b>{profile?.role}</b>). Les modules de gestion
          (Formations, Modules/Cours, Quiz, Étudiants, Certificats…) arrivent aux phases suivantes,
          en respectant l'ordre du cahier des charges.
        </p>
        <Link className="btn btn-outline" to="/dashboard">← Retour au site</Link>
      </main>
    </div>
  );
}
