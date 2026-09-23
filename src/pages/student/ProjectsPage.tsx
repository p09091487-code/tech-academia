import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import PublicLayout from "../../layouts/PublicLayout";
import { useAuth } from "../../context/AuthContext";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [desc, setDesc] = useState("");

  async function load() {
    const { data: p } = await supabase.from("projects").select("*").eq("published", true);
    setProjects(p ?? []);
    if (user) {
      const { data: subs } = await supabase.from("project_submissions").select("*").eq("user_id", user.id);
      const map: Record<string, any> = {};
      (subs ?? []).forEach((s: any) => { if (s.project_id) map[s.project_id] = s; });
      setSubmissions(map);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, [user]);

  async function submit(project: any) {
    if (!user || !desc.trim()) return;
    await supabase.from("project_submissions").insert({ user_id: user.id, project_id: project.id, formation_slug: "", title: project.title, description: desc, status: "submitted" });
    setDesc(""); setOpenId(null); load();
  }

  if (loading) return <PublicLayout><div className="admin-empty">Chargement…</div></PublicLayout>;

  return (
    <PublicLayout>
      <section className="page">
        <span className="eyebrow">PROJETS</span>
        <h1>Mes projets</h1>
        {projects.length === 0 ? <div className="admin-empty">Aucun projet disponible.</div> : projects.map((p) => {
          const sub = submissions[p.id];
          return (
            <div className="admin-section" key={p.id}>
              <h2 style={{ fontSize: 17 }}>{p.title}</h2>
              <p>{p.instructions}</p>
              {sub ? (
                <p>Statut : <span className={`admin-badge ${sub.status === "validated" ? "on" : "off"}`}>{sub.status}</span> {sub.grade && `· Note : ${sub.grade}`} {sub.feedback && <><br />Retour : {sub.feedback}</>}</p>
              ) : openId === p.id ? (
                <div>
                  <textarea rows={4} style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} placeholder="Décris ton projet ou colle un lien..." value={desc} onChange={(e) => setDesc(e.target.value)} />
                  <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={() => submit(p)}>Envoyer</button>
                </div>
              ) : (
                <button className="btn btn-outline" onClick={() => setOpenId(p.id)}>Soumettre mon projet</button>
              )}
            </div>
          );
        })}
      </section>
    </PublicLayout>
  );
}
