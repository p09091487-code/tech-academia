import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import PublicLayout from "../../layouts/PublicLayout";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const { profile, user, signOut } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => { (async () => {
    if (!user) return;
    const { data } = await supabase.from("enrollments").select("*").eq("user_id", user.id);
    const rows = data ?? [];
    setEnrollments(rows);
    const next: Record<string, number> = {};
    for (const e of rows) {
      const { data: f } = await supabase.from("formations").select("id").eq("slug", e.formation_slug).maybeSingle();
      if (!f) continue;
      const { data: mods } = await supabase.from("modules").select("id").eq("formation_id", f.id).eq("published", true);
      const ids = (mods ?? []).map((m: any) => m.id);
      if (!ids.length) { next[e.formation_slug] = 0; continue; }
      const { data: courses } = await supabase.from("courses").select("id").in("module_id", ids).eq("published", true);
      const courseIds = (courses ?? []).map((c: any) => c.id);
      if (!courseIds.length) { next[e.formation_slug] = 0; continue; }
      const { data: done } = await supabase.from("course_progress").select("course_id").eq("user_id", user.id).eq("completed", true).in("course_id", courseIds);
      next[e.formation_slug] = Math.round(((done ?? []).length / courseIds.length) * 100);
    }
    setProgress(next);
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
                  <p style={{ margin: "6px 0", color: "#64748b" }}>Progression : <b>{progress[e.formation_slug] ?? 0}%</b></p>
                  <div style={{ height: 7, background: "#e2e8f0", borderRadius: 999, marginBottom: 10 }}><div style={{ height: 7, width: `${progress[e.formation_slug] ?? 0}%`, background: "#0f172a", borderRadius: 999 }} /></div>
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
