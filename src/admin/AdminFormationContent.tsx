import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { deleteRow, insertRow, updateRow, slugify } from "../services/db";

interface Module {
  id: string;
  formation_id: string;
  title: string;
  position: number;
  published: boolean;
  image_url: string | null;
}

interface Course {
  id: string;
  module_id: string;
  title: string;
  slug: string;
  content: string | null;
  video_url: string | null;
  pdf_url: string | null;
  position: number;
  published: boolean;
  duration: string | null;
  image_url: string | null;
}

const emptyCourse = {
  title: "",
  content: "",
  video_url: "",
  pdf_url: "",
  duration: "",
};

export default function AdminFormationContent() {
  const { id } = useParams();
  const [formationTitle, setFormationTitle] = useState("");
  const [modules, setModules] = useState<Module[]>([]);
  const [courses, setCourses] = useState<Record<string, Course[]>>({});
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newCourse, setNewCourse] = useState<Record<string, string>>({});
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    if (!id) return;

    const { data: f } = await supabase
      .from("formations")
      .select("title")
      .eq("id", id)
      .maybeSingle();

    setFormationTitle(f?.title ?? "");

    const { data: mods, error: modulesError } = await supabase
      .from("modules")
      .select("*")
      .eq("formation_id", id)
      .order("position", { ascending: true });

    if (modulesError) {
      alert("Erreur lors du chargement des modules : " + modulesError.message);
      return;
    }

    const sortedModules = (mods ?? []) as Module[];
    setModules(sortedModules);

    const modIds = sortedModules.map((m) => m.id);
    if (!modIds.length) {
      setCourses({});
      return;
    }

    const { data: crs, error: coursesError } = await supabase
      .from("courses")
      .select("*")
      .in("module_id", modIds)
      .order("position", { ascending: true });

    if (coursesError) {
      alert("Erreur lors du chargement des cours : " + coursesError.message);
      return;
    }

    const grouped: Record<string, Course[]> = {};
    for (const c of (crs ?? []) as Course[]) {
      grouped[c.module_id] = grouped[c.module_id] || [];
      grouped[c.module_id].push(c);
    }

    setCourses(grouped);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function addModule() {
    if (!newModuleTitle.trim() || !id || saving) return;

    setSaving(true);
    try {
      await insertRow("modules", {
        formation_id: id,
        title: newModuleTitle.trim(),
        position: modules.length,
        published: false,
      });
      setNewModuleTitle("");
      await load();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveModuleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingModule || saving) return;

    setSaving(true);
    try {
      await updateRow("modules", editingModule.id, {
        title: editingModule.title.trim(),
        image_url: editingModule.image_url || null,
      });
      setEditingModule(null);
      await load();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteModule(m: Module) {
    if (
      !confirm(
        `Supprimer le module "${m.title}" et tous ses cours ? Cette action est irréversible.`
      )
    )
      return;

    try {
      await deleteRow("modules", m.id);
      await load();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  }

  async function toggleModulePublish(m: Module) {
    try {
      await updateRow("modules", m.id, { published: !m.published });
      await load();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  }

  async function moveModule(m: Module, dir: -1 | 1) {
    const idx = modules.findIndex((x) => x.id === m.id);
    const swap = modules[idx + dir];
    if (!swap) return;

    try {
      await updateRow("modules", m.id, { position: swap.position });
      await updateRow("modules", swap.id, { position: m.position });
      await load();
    } catch (err: any) {
      alert("Erreur lors de la réorganisation : " + err.message);
      await load();
    }
  }

  async function addCourse(moduleId: string) {
    const title = newCourse[moduleId];
    if (!title?.trim() || saving) return;

    setSaving(true);
    try {
      const count = courses[moduleId]?.length ?? 0;
      await insertRow("courses", {
        module_id: moduleId,
        title: title.trim(),
        slug: slugify(title.trim()),
        position: count,
        published: false,
        content: "",
        video_url: null,
        pdf_url: null,
        duration: null,
        image_url: null,
      });

      setNewCourse((prev) => ({ ...prev, [moduleId]: "" }));
      await load();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteCourse(c: Course) {
    if (!confirm(`Supprimer le cours "${c.title}" ? Cette action est irréversible.`))
      return;

    try {
      await deleteRow("courses", c.id);
      await load();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  }

  async function toggleCoursePublish(c: Course) {
    try {
      await updateRow("courses", c.id, { published: !c.published });
      await load();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  }

  async function moveCourse(moduleId: string, course: Course, dir: -1 | 1) {
    const list = courses[moduleId] ?? [];
    const idx = list.findIndex((x) => x.id === course.id);
    const swap = list[idx + dir];
    if (!swap) return;

    try {
      await updateRow("courses", course.id, { position: swap.position });
      await updateRow("courses", swap.id, { position: course.position });
      await load();
    } catch (err: any) {
      alert("Erreur lors de la réorganisation : " + err.message);
      await load();
    }
  }

  async function saveCourseEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCourse || saving) return;

    setSaving(true);
    try {
      await updateRow("courses", editingCourse.id, {
        title: editingCourse.title.trim(),
        slug: slugify(editingCourse.title.trim()),
        content: editingCourse.content || "",
        video_url: editingCourse.video_url || null,
        pdf_url: editingCourse.pdf_url || null,
        duration: editingCourse.duration || null,
        image_url: editingCourse.image_url || null,
      });
      setEditingCourse(null);
      await load();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    } finally {
      setSaving(false);
    }
  }

  if (editingModule) {
    return (
      <div>
        <div className="admin-toolbar">
          <h1>Modifier le module</h1>
          <button
            className="btn btn-ghost"
            onClick={() => setEditingModule(null)}
          >
            ← Retour
          </button>
        </div>

        <form className="admin-form" onSubmit={saveModuleEdit}>
          <label>
            Titre du module
            <input
              required
              autoFocus
              value={editingModule.title}
              onChange={(e) =>
                setEditingModule({ ...editingModule, title: e.target.value })
              }
            />
          </label>

          <label>
            Image du module (URL)
            <input
              value={editingModule.image_url || ""}
              placeholder="/images/module-web.jpg"
              onChange={(e) =>
                setEditingModule({ ...editingModule, image_url: e.target.value })
              }
            />
          </label>

          <div className="admin-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setEditingModule(null)}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (editingCourse) {
    return (
      <div>
        <div className="admin-toolbar">
          <h1>Modifier le cours</h1>
          <button
            className="btn btn-ghost"
            onClick={() => setEditingCourse(null)}
          >
            ← Retour
          </button>
        </div>

        <form className="admin-form" onSubmit={saveCourseEdit}>
          <label>
            Titre
            <input
              required
              value={editingCourse.title}
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, title: e.target.value })
              }
            />
          </label>

          <label>
            Contenu du cours
            <textarea
              rows={10}
              value={editingCourse.content ?? ""}
              onChange={(e) =>
                setEditingCourse({
                  ...editingCourse,
                  content: e.target.value,
                })
              }
            />
          </label>

          <div className="admin-form-row">
            <label>
              URL vidéo
              <input
                value={editingCourse.video_url || ""}
                placeholder="https://..."
                onChange={(e) =>
                  setEditingCourse({
                    ...editingCourse,
                    video_url: e.target.value,
                  })
                }
              />
            </label>

            <label>
              URL PDF
              <input
                value={editingCourse.pdf_url || ""}
                placeholder="https://..."
                onChange={(e) =>
                  setEditingCourse({
                    ...editingCourse,
                    pdf_url: e.target.value,
                  })
                }
              />
            </label>
          </div>

          <label>
            Durée
            <input
              value={editingCourse.duration || ""}
              placeholder="Ex. 12 min"
              onChange={(e) =>
                setEditingCourse({
                  ...editingCourse,
                  duration: e.target.value,
                })
              }
            />
          </label>

          <label>
            Image du cours (URL)
            <input
              value={editingCourse.image_url || ""}
              placeholder="/images/course-web.jpg"
              onChange={(e) =>
                setEditingCourse({ ...editingCourse, image_url: e.target.value })
              }
            />
          </label>

          <div className="admin-actions">
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => setEditingCourse(null)}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-toolbar">
        <div>
          <Link
            to="/admin/formations"
            style={{ fontSize: 13, color: "#64748b" }}
          >
            ← Toutes les formations
          </Link>
          <h1>{formationTitle || "Formation"}</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b" }}>
            Gérez les modules et les cours de cette formation.
          </p>
        </div>
      </div>

      {modules.map((m, idx) => {
        const moduleCourses = courses[m.id] ?? [];

        return (
          <div className="admin-section" key={m.id}>
            <div className="admin-toolbar" style={{ marginBottom: 10 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {m.image_url && <img src={m.image_url} alt="" style={{ width: 54, height: 40, objectFit: "cover", borderRadius: 8 }} />}
                  <h2 style={{ margin: 0 }}>
                    Module {idx + 1} — {m.title}
                  </h2>
                </div>
                <small style={{ color: "#64748b" }}>
                  {moduleCourses.length} cours
                </small>
              </div>

              <div className="admin-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => moveModule(m, -1)}
                  disabled={idx === 0}
                  title="Monter le module"
                >
                  ↑
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => moveModule(m, 1)}
                  disabled={idx === modules.length - 1}
                  title="Descendre le module"
                >
                  ↓
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setEditingModule(m)}
                >
                  Modifier
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => toggleModulePublish(m)}
                >
                  {m.published ? "Dépublier" : "Publier"}
                </button>
                <button className="btn btn-ghost" onClick={() => deleteModule(m)}>
                  Supprimer
                </button>
              </div>
            </div>

            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cours</th>
                  <th>Statut</th>
                  <th style={{ width: 360 }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {moduleCourses.map((c, courseIdx) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {c.image_url && <img src={c.image_url} alt="" style={{ width: 64, height: 42, objectFit: "cover", borderRadius: 8 }} />}
                        <b>{courseIdx + 1}. {c.title}</b>
                      </div>
                      {c.duration && (
                        <small style={{ display: "block", color: "#94a3b8" }}>
                          {c.duration}
                        </small>
                      )}
                    </td>

                    <td>
                      <span
                        className={`admin-badge ${
                          c.published ? "on" : "off"
                        }`}
                      >
                        {c.published ? "Publié" : "Brouillon"}
                      </span>
                    </td>

                    <td className="admin-actions">
                      <button
                        className="btn btn-outline"
                        onClick={() => moveCourse(m.id, c, -1)}
                        disabled={courseIdx === 0}
                        title="Monter le cours"
                      >
                        ↑
                      </button>
                      <button
                        className="btn btn-outline"
                        onClick={() => moveCourse(m.id, c, 1)}
                        disabled={courseIdx === moduleCourses.length - 1}
                        title="Descendre le cours"
                      >
                        ↓
                      </button>
                      <button
                        className="btn btn-outline"
                        onClick={() => setEditingCourse(c)}
                      >
                        Modifier
                      </button>
                      <button
                        className="btn btn-outline"
                        onClick={() => toggleCoursePublish(c)}
                      >
                        {c.published ? "Dépublier" : "Publier"}
                      </button>
                      <button
                        className="btn btn-ghost"
                        onClick={() => deleteCourse(c)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}

                <tr>
                  <td colSpan={3}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        placeholder="Titre du nouveau cours"
                        value={newCourse[m.id] || ""}
                        onChange={(e) =>
                          setNewCourse({
                            ...newCourse,
                            [m.id]: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCourse(m.id);
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: 8,
                          border: "1px solid #cbd5e1",
                          borderRadius: 8,
                        }}
                      />
                      <button
                        className="btn btn-outline"
                        onClick={() => addCourse(m.id)}
                        type="button"
                        disabled={saving}
                      >
                        + Ajouter le cours
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}

      <div className="admin-section">
        <h2 style={{ marginTop: 0 }}>Ajouter un module</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Titre du nouveau module"
            value={newModuleTitle}
            onChange={(e) => setNewModuleTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addModule();
              }
            }}
            style={{
              flex: 1,
              padding: 10,
              border: "1px solid #cbd5e1",
              borderRadius: 8,
            }}
          />
          <button
            className="btn btn-primary"
            onClick={addModule}
            disabled={saving}
          >
            + Ajouter un module
          </button>
        </div>
      </div>
    </div>
  );
}
