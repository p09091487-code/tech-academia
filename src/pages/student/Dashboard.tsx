import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import PublicLayout from "../../layouts/PublicLayout";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { profile, user, signOut } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    if (!user) return;
    const { data } = await supabase.from("enrollments").select("*").eq("user_id", user.id);
    setEnrollments(data ?? []);
    setLoading(false);
  })(); }, [user]);

  return (
    <PublicLayout>
      <section className="page">
        <span className="eyebrow">MON ESPACE</span>
        <h1>Bienvenue {profile?.full_name || user?.email} 👋</h1>
        <p>Rôle : <b>{profile?.role ?? "…"}</b></p>

        <div className="hero-actions" style={{ marginBottom: 24 }}>
          {profile?.role === "ADMIN" && <Link className="btn btn-primary" to="/admin">Aller à l'espace admin</Link>}
          <Link className="btn btn-outline" to="/projets">Mes projets</Link>
          <Link className="btn btn-outline" to="/mes-certificats">Mes certificats</Link>
          <Link className="btn btn-outline" to="/mes-favoris">Mes favoris</Link>
          <button className="btn btn-ghost" onClick={() => signOut()}>Se déconnecter</button>
        </div>

        <h2>Mes formations</h2>
        {loading ? <div className="admin-empty">Chargement…</div> : enrollments.length === 0 ? (
          <div className="admin-empty">Tu n'es inscrit à aucune formation. <Link to="/formations">Découvrir le catalogue →</Link></div>
        ) : (
          <div className="cards">
            {enrollments.map((e) => (
              <div className="course-card" key={e.id}>
                <div className="course-body">
                  <h3>{e.formation_slug}</h3>
                  <Link to={`/cours/${e.formation_slug}`}>Continuer →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
