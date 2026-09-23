import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const counts: Record<string, number> = {};
      const tables: [string, string][] = [
        ["students", "profiles"], ["formations", "formations"], ["courses", "courses"],
        ["quizzes", "quizzes"], ["certificates", "certificates"], ["enrollments", "enrollments"],
        ["payments", "payments"], ["blog_posts", "blog_posts"],
      ];
      for (const [key, table] of tables) {
        const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
        counts[key] = count ?? 0;
      }
      const { count: studentCount } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "STUDENT");
      counts.students = studentCount ?? 0;
      const { data: paid } = await supabase.from("payments").select("amount").eq("status", "paid");
      counts.revenue = (paid ?? []).reduce((sum, p: any) => sum + Number(p.amount || 0), 0);
      setStats(counts);
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: "Étudiants", key: "students", suffix: "comptes" },
    { label: "Formations", key: "formations", suffix: "au catalogue" },
    { label: "Cours", key: "courses", suffix: "contenus" },
    { label: "Quiz", key: "quizzes", suffix: "évaluations" },
    { label: "Inscriptions", key: "enrollments", suffix: "au total" },
    { label: "Certificats", key: "certificates", suffix: "délivrés" },
    { label: "Paiements", key: "payments", suffix: "transactions" },
    { label: "Revenus (XOF)", key: "revenue", suffix: "cumulés" },
    { label: "Articles blog", key: "blog_posts", suffix: "publiés/brouillons" },
  ];

  return (
    <div>
      <h1>Tableau de bord</h1>
      <p style={{ color: "#64748b", marginBottom: 24 }}>
        Toutes les données ci-dessous viennent directement de Supabase. Aucun chiffre n'est inventé —
        si rien n'existe encore, ça affiche 0.
      </p>
      {loading ? (
        <div className="admin-empty">Chargement des statistiques…</div>
      ) : (
        <div className="admin-stat-grid">
          {cards.map((c) => (
            <div className="admin-stat-card" key={c.key}>
              <span>{c.label}</span>
              <b>{c.key === "revenue" ? `${(stats[c.key] ?? 0).toLocaleString("fr-FR")}` : stats[c.key] ?? 0}</b>
              <span>{c.suffix}</span>
            </div>
          ))}
        </div>
      )}
      <div className="admin-section">
        <h2>Actions rapides</h2>
        <div className="admin-actions">
          <Link className="btn btn-primary" to="/admin/formations">+ Nouvelle formation</Link>
          <Link className="btn btn-outline" to="/admin/quizzes">+ Nouveau quiz</Link>
          <Link className="btn btn-outline" to="/admin/blog">+ Article de blog</Link>
        </div>
      </div>
    </div>
  );
}
