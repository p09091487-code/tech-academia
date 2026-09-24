import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import PublicLayout from "../../layouts/PublicLayout";
import { useAuth } from "../../context/AuthContext";

export default function CourseView() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [formation, setFormation] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [courses, setCourses] = useState<Record<string, any[]>>({});
  const [active, setActive] = useState<any>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [moduleQuizzes, setModuleQuizzes] = useState<Record<string, any>>({});
  const [finalQuiz, setFinalQuiz] = useState<any>(null);

  useEffect(() => { (async () => {
    const { data: f } = await supabase.from("formations").select("*").eq("slug", slug).maybeSingle();
    setFormation(f);
    if (f) {
      const { data: mods } = await supabase.from("modules").select("*").eq("formation_id", f.id).eq("published", true).order("position");
      setModules(mods ?? []);
      const { data: finalQuizRow } = await supabase.from("quizzes").select("id,title,pass_percent,kind").eq("formation_slug", f.slug).eq("kind", "final").eq("published", true).maybeSingle();
      setFinalQuiz(finalQuizRow ?? null);
      if ((mods ?? []).length) {
        const { data: moduleQuizRows } = await supabase.from("quizzes").select("id,module_id,title,pass_percent,kind").in("module_id", (mods ?? []).map((m: any) => m.id)).eq("kind", "module").eq("published", true);
        const mq: Record<string, any> = {};
        for (const q of moduleQuizRows ?? []) mq[q.module_id] = q;
        setModuleQuizzes(mq);
      }
      const modIds = (mods ?? []).map((m: any) => m.id);
      let allCourses: any[] = [];
      if (modIds.length) {
        const { data: crs } = await supabase.from("courses").select("*").in("module_id", modIds).eq("published", true).order("position");
        allCourses = crs ?? [];
        const grouped: Record<string, any[]> = {};
        for (const c of allCourses) { grouped[c.module_id] = grouped[c.module_id] || []; grouped[c.module_id].push(c); }
        setCourses(grouped);
        setActive(allCourses[0] ?? null);
      }
      if (user && allCourses.length) {
        const { data: prog } = await supabase.from("course_progress").select("course_id").eq("user_id", user.id).eq("completed", true).in("course_id", allCourses.map((c) => c.id));
        setDone(new Set((prog ?? []).map((p: any) => p.course_id)));
      }
    }
    setLoading(false);
  })(); }, [slug, user]);

  async function markComplete(courseId: string) {
    if (!user) return;
    await supabase.from("course_progress").upsert({ user_id: user.id, course_id: courseId, completed: true, completed_at: new Date().toISOString() });
    setDone(new Set([...done, courseId]));
  }

  if (loading) return <PublicLayout><div className="admin-empty">Chargement…</div></PublicLayout>;
  if (!formation) return <PublicLayout><section className="page"><h1>Formation introuvable</h1></section></PublicLayout>;

  const totalCourses = Object.values(courses).reduce((n, arr) => n + arr.length, 0);
  const progressPct = totalCourses ? Math.round((done.size / totalCourses) * 100) : 0;

  return (
    <PublicLayout>
      <section className="page course-shell">
        <aside>
          <Link to="/dashboard" style={{ fontSize: 13 }}>← Dashboard</Link>
          <h2 style={{ fontSize: 18, margin: "10px 0" }}>{formation.title}</h2>
          <div style={{ marginBottom: 16, fontSize: 13, color: "#64748b" }}>Progression : {progressPct}%
            <div style={{ height: 6, background: "#e2e8f0", borderRadius: 999, marginTop: 4 }}>
              <div style={{ height: 6, width: `${progressPct}%`, background: "#0f172a", borderRadius: 999 }} />
            </div>
          </div>
          {modules.map((m, i) => (
            <div key={m.id} style={{ marginBottom: 12 }}>
              <b style={{ fontSize: 13 }}>MODULE {i + 1} — {m.title}</b>
              <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 6 }}>
                {(courses[m.id] ?? []).map((c) => (
                  <button key={c.id} onClick={() => setActive(c)} style={{ textAlign: "left", background: active?.id === c.id ? "#f1f5f9" : "transparent", border: "none", padding: "6px 8px", borderRadius: 6, fontSize: 13, cursor: "pointer" }}>
                    {done.has(c.id) ? "✓" : "○"} {c.title}
                  </button>
                ))}
              </div>
              {moduleQuizzes[m.id] && (
                <Link className="btn btn-outline" style={{ marginTop: 6, width: "100%", textAlign: "center" }} to={`/quiz/${moduleQuizzes[m.id].id}`}>🧪 Quiz du module</Link>
              )}
            </div>
          ))}
        </aside>
        <div>
          {active ? (
            <>
              {active.image_url && <img src={active.image_url} alt="" style={{ width: "100%", maxHeight: 340, objectFit: "cover", borderRadius: 18, marginBottom: 20 }} />}
              <h1>{active.title}</h1>
              {active.video_url && <p><a href={active.video_url} target="_blank" rel="noreferrer">▶ Voir la vidéo</a></p>}
              {active.pdf_url && <p><a href={active.pdf_url} target="_blank" rel="noreferrer">📄 Télécharger le PDF</a></p>}
              <p style={{ whiteSpace: "pre-line" }}>{active.content || "Contenu à venir."}</p>
              <button className="btn btn-primary" onClick={() => markComplete(active.id)} disabled={done.has(active.id)}>
                {done.has(active.id) ? "✓ Terminé" : "Marquer comme terminé"}
              </button>
              {finalQuiz && progressPct === 100 && (
                <div className="buy-box" style={{ marginTop: 18 }}>
                  <b>🎓 Dernière étape</b>
                  <p>Tu as terminé tous les cours publiés. Passe maintenant l’évaluation finale pour valider la formation et débloquer ton certificat si tu réussis.</p>
                  <Link className="btn btn-outline" to={`/quiz/${finalQuiz.id}`}>Passer l’évaluation finale →</Link>
                </div>
              )}
            </>
          ) : <p>Aucun cours disponible pour l'instant.</p>}
        </div>
      </section>
    </PublicLayout>
  );
}
