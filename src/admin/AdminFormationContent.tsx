import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { deleteRow, insertRow, updateRow, slugify } from "../services/db";

interface Module { id: string; formation_id: string; title: string; position: number; published: boolean; }
interface Course { id: string; module_id: string; title: string; slug: string; content: string; video_url: string | null; pdf_url: string | null; position: number; published: boolean; duration: string; }

export default function AdminFormationContent() {
  const { id } = useParams();
  const [formationTitle, setFormationTitle] = useState("");
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Record<string, Course[]>>({});
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newCourse, setNewCourse] = useState<Record<string, string>>({});
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  async function load() {
    if (!id) return;
    const { data: f } = await supabase.from("formations").select("title").eq("id", id).maybeSingle();
    setFormationTitle(f?.title ?? "");
    const { data: mods } = await supabase.from("modules").select("*").eq("formation_id", id).order("position");
    setModules((mods ?? []) as Module[]);
    const modIds = (mods ?? []).map((m: any) => m.id);
    if (modIds.length) {
      const { data: crs } = await supabase.from("courses").select("*").in("module_id", modIds).order("position");
      const grouped: Record<string, Course[]> = {};
      for (const c of (crs ?? []) as Course[]) {
        grouped[c.module_id] = grouped[c.module_id] || [];
        grouped[c.module_id].push(c);
      }
      setCourses(grouped);
    } else {
      setCourses({});
    }
  }
  useEffect(() => { load(); }, [id]);

  async function addModule() {
    if (!newModuleTitle.trim() || !id) return;
    await insertRow("modules", { formation_id: id, title: newModuleTitle, position: modules.length });
    setNewModuleTitle("");
    load();
  }
  async function deleteModule(m: Module) {
    if (!confirm(`Supprimer le module "${m.title}" et tous ses cours ?`)) return;
    await deleteRow("modules", m.id);
    load();
  }
  async function toggleModulePublish(m: Module) {
    await updateRow("modules", m.id, { published: !m.published });
    load();
  }
  async function moveModule(m: Module, dir: -1 | 1) {
    const idx = modules.findIndex((x) => x.id === m.id);
    const swap = modules[idx + dir];
    if (!swap) return;
    await updateRow("modules", m.id, { position: swap.position });
    await updateRow("modules", swap.id, { position: m.position });
    load();
  }

  async function addCourse(moduleId: string) {
    const title = newCourse[moduleId];
    if (!title?.trim()) return;
    const count = courses[moduleId]?.length ?? 0;
    await insertRow("courses", { module_id: moduleId, title, slug: slugify(title), position: count });
    setNewCourse({ ...newCourse, [moduleId]: "" });
    load();
  }
  async function deleteCourse(c: Course) {
    if (!confirm(`Supprimer le cours "${c.title}" ?`)) return;
    await deleteRow("courses", c.id);
    load();
  }
  async function toggleCoursePublish(c: Course) {
    await updateRow("courses", c.id, { published: !c.published });
    load();
  }
  async function saveCourseEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCourse) return;
    await updateRow("courses", editingCourse.id, {
      title: editingCourse.title, content: editingCourse.content,
      video_url: editingCourse.video_url, pdf_url: editingCourse.pdf_url,
      duration: editingCourse.duration,
    });
    setEditingCourse(null);
    load();
  }

  if (editingCourse) {
    return (
      <div>
        <div className="admin-toolbar">
          <h1>Modifier le cours</h1>
          <button className="btn btn-ghost" onClick={() => setEditingCourse(null)}>← Retour</button>
        </div>
        <form className="admin-form" onSubmit={saveCourseEdit}>
          <label>Titre<input value={editingCourse.title} onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })} /></label>
          <label>Contenu texte<textarea rows={6} value={editingCourse.content} onChange={(e) => setEditingCourse({ ...editingCourse, content: e.target.value })} /></label>
          <div className="admin-form-row">
            <label>URL vidéo<input value={editingCourse.video_url || ""} onChange={(e) => setEditingCourse({ ...editingCourse, video_url: e.target.value })} /></label>
            <label>URL PDF<input value={editingCourse.pdf_url || ""} onChange={(e) => setEditingCourse({ ...editingCourse, pdf_url: e.target.value })} /></label>
          </div>
          <label>Durée (ex: 12 min)<input value={editingCourse.duration} onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })} /></label>
          <button className="btn btn-primary" type="submit">Enregistrer</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-toolbar">
        <div>
          <Link to="/admin/formations" style={{ fontSize: 13, color: "#64748b" }}>← Toutes les formations</Link>
          <h1>{formationTitle}</h1>
        </div>
      </div>

      {modules.map((m, idx) => (
        <div className="admin-section" key={m.id}>
          <div className="admin-toolbar" style={{ marginBottom: 10 }}>
            <h2 style={{ margin: 0 }}>Module {idx + 1} — {m.title}</h2>
            <div className="admin-actions">
              <button className="btn btn-outline" onClick={() => moveModule(m, -1)} disabled={idx === 0}>↑</button>
              <button className="btn btn-outline" onClick={() => moveModule(m, 1)} disabled={idx === modules.length - 1}>↓</button>
              <button className="btn btn-outline" onClick={() => toggleModulePublish(m)}>{m.published ? "Dépublier" : "Publier"}</button>
              <button className="btn btn-ghost" onClick={() => deleteModule(m)}>Supprimer</button>
            </div>
          </div>
          <table className="admin-table">
            <tbody>
              {(courses[m.id] ?? []).map((c) => (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td><span className={`admin-badge ${c.published ? "on" : "off"}`}>{c.published ? "Publié" : "Brouillon"}</span></td>
                  <td className="admin-actions">
                    <button className="btn btn-outline" onClick={() => setEditingCourse(c)}>Modifier</button>
                    <button className="btn btn-outline" onClick={() => toggleCoursePublish(c)}>{c.published ? "Dépublier" : "Publier"}</button>
                    <button className="btn btn-ghost" onClick={() => deleteCourse(c)}>Supprimer</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={3}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input placeholder="Titre du nouveau cours" value={newCourse[m.id] || ""} onChange={(e) => setNewCourse({ ...newCourse, [m.id]: e.target.value })} style={{ flex: 1, padding: 8, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                    <button className="btn btn-outline" onClick={() => addCourse(m.id)} type="button">+ Ajouter le cours</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}

      <div className="admin-section">
        <div style={{ display: "flex", gap: 8 }}>
          <input placeholder="Titre du nouveau module" value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} style={{ flex: 1, padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
          <button className="btn btn-primary" onClick={addModule}>+ Ajouter un module</button>
        </div>
      </div>
    </div>
  );
}
