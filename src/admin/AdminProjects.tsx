import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { deleteRow, insertRow, updateRow } from "../services/db";

export default function AdminProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data: p } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects(p ?? []);
    const { data: f } = await supabase.from("formations").select("id, title");
    setFormations(f ?? []);
    const { data: s } = await supabase.from("project_submissions").select("*, profiles(full_name)").order("submitted_at", { ascending: false });
    setSubmissions(s ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing.id) await updateRow("projects", editing.id, editing);
      else await insertRow("projects", editing);
      setEditing(null); load();
    } catch (err: any) { alert("Erreur : " + err.message); }
  }
  async function togglePublish(p: any) { await updateRow("projects", p.id, { published: !p.published }); load(); }
  async function remove(p: any) { if (confirm("Supprimer ce projet ?")) { await deleteRow("projects", p.id); load(); } }

  async function grade(sub: any) {
    const grade = prompt("Note (optionnel) :", sub.grade ?? "");
    const feedback = prompt("Commentaire :", sub.feedback ?? "");
    const status = confirm("Valider la soumission ? (Annuler = refuser)") ? "validated" : "rejected";
    await updateRow("project_submissions", sub.id, { grade: grade ? Number(grade) : null, feedback, status });
    await insertRow("notifications", { user_id: sub.user_id, title: status === "validated" ? "Projet validé ✅" : "Projet à revoir", body: feedback || sub.title });
    load();
  }

  if (editing) {
    return (
      <div>
        <div className="admin-toolbar"><h1>{editing.id ? "Modifier le projet" : "Nouveau projet"}</h1><button className="btn btn-ghost" onClick={() => setEditing(null)}>← Annuler</button></div>
        <form className="admin-form" onSubmit={save}>
          <label>Titre<input required value={editing.title || ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></label>
          <label>Formation
            <select value={editing.formation_id || ""} onChange={(e) => setEditing({ ...editing, formation_id: e.target.value })}>
              <option value="">— Aucune —</option>
              {formations.map((f) => <option key={f.id} value={f.id}>{f.title}</option>)}
            </select>
          </label>
          <label>Consignes<textarea rows={5} value={editing.instructions || ""} onChange={(e) => setEditing({ ...editing, instructions: e.target.value })} /></label>
          <button className="btn btn-primary" type="submit">Enregistrer</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-toolbar"><h1>Projets</h1><button className="btn btn-primary" onClick={() => setEditing({ title: "", instructions: "", formation_id: "" })}>+ Nouveau projet</button></div>
      {loading ? <div className="admin-empty">Chargement…</div> : (
        <>
          <table className="admin-table" style={{ marginBottom: 28 }}>
            <thead><tr><th>Titre</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td><span className={`admin-badge ${p.published ? "on" : "off"}`}>{p.published ? "Publié" : "Brouillon"}</span></td>
                  <td className="admin-actions">
                    <button className="btn btn-outline" onClick={() => setEditing(p)}>Modifier</button>
                    <button className="btn btn-outline" onClick={() => togglePublish(p)}>{p.published ? "Dépublier" : "Publier"}</button>
                    <button className="btn btn-ghost" onClick={() => remove(p)}>Supprimer</button>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && <tr><td colSpan={3} className="admin-empty">Aucun projet.</td></tr>}
            </tbody>
          </table>
          <h2>Soumissions des étudiants</h2>
          <table className="admin-table">
            <thead><tr><th>Étudiant</th><th>Titre</th><th>Statut</th><th>Note</th><th></th></tr></thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id}>
                  <td>{s.profiles?.full_name || "—"}</td>
                  <td>{s.title}</td>
                  <td><span className={`admin-badge ${s.status === "validated" ? "on" : "off"}`}>{s.status}</span></td>
                  <td>{s.grade ?? "—"}</td>
                  <td><button className="btn btn-outline" onClick={() => grade(s)}>Corriger</button></td>
                </tr>
              ))}
              {submissions.length === 0 && <tr><td colSpan={5} className="admin-empty">Aucune soumission.</td></tr>}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
