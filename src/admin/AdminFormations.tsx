import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { deleteRow, insertRow, slugify, updateRow } from "../services/db";
import ImagePicker from "../components/ImagePicker";
import GalleryPicker from "../components/GalleryPicker";

interface Formation {
  id: string; slug: string; title: string; subtitle: string; short_description: string;
  description: string; price: number; currency: string; category_id: string | null;
  level: string; duration: string; cover_image: string | null; published: boolean;
}
interface Category { id: string; label: string; }

const LEVELS = [
  { id: "debutant", label: "Débutant" },
  { id: "intermediaire", label: "Intermédiaire" },
  { id: "avance", label: "Avancé" },
];

const EMPTY: Partial<Formation> = {
  title: "", subtitle: "", short_description: "", description: "", price: 0,
  currency: "XOF", category_id: "", level: "debutant", duration: "", cover_image: "",
};

export default function AdminFormations() {
  const [items, setItems] = useState<Formation[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Formation> | null>(null);

  async function load() {
    setLoading(true);
    const { data: f } = await supabase.from("formations").select("*").order("created_at", { ascending: false });
    const { data: c } = await supabase.from("formation_categories").select("id, label").order("position");
    setItems((f ?? []) as Formation[]);
    setCategories((c ?? []) as Category[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const slug = editing.slug || slugify(editing.title || "");
    const payload = { ...editing, slug, price: Number(editing.price) || 0, category_id: editing.category_id || null };
    try {
      if (editing.id) {
        await updateRow("formations", editing.id, payload);
      } else {
        await insertRow("formations", payload);
      }
      setEditing(null);
      load();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  }

  async function togglePublish(f: Formation) {
    await updateRow("formations", f.id, { published: !f.published });
    load();
  }

  async function handleDelete(f: Formation) {
    if (!confirm(`Supprimer définitivement "${f.title}" ainsi que ses modules et cours ?`)) return;
    await deleteRow("formations", f.id);
    load();
  }

  if (editing) {
    return (
      <div>
        <div className="admin-toolbar">
          <h1>{editing.id ? "Modifier la formation" : "Nouvelle formation"}</h1>
          <button className="btn btn-ghost" onClick={() => setEditing(null)}>← Annuler</button>
        </div>
        <form className="admin-form" onSubmit={handleSave}>
          <label>Titre
            <input required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
          </label>
          <label>Sous-titre
            <input value={editing.subtitle} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} />
          </label>
          <label>Description courte (carte catalogue)
            <textarea rows={2} value={editing.short_description} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })} />
          </label>
          <label>Description complète
            <textarea rows={5} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </label>
          <div className="admin-form-row">
            <label>Catégorie
              <select value={editing.category_id || ""} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}>
                <option value="">— Choisir —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </label>
            <label>Niveau
              <select value={editing.level} onChange={(e) => setEditing({ ...editing, level: e.target.value })}>
                {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </label>
          </div>
          <div className="admin-form-row">
            <label>Prix (XOF)
              <input type="number" min={0} value={editing.price} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} />
            </label>
            <label>Durée (ex: 6 semaines)
              <input value={editing.duration} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} />
            </label>
          </div>
          <ImagePicker label="Image de couverture" value={editing.cover_image || ""} onChange={(url) => setEditing({ ...editing, cover_image: url })} />
          <GalleryPicker value={(editing as any).gallery_images || []} onChange={(urls) => setEditing({ ...editing, gallery_images: urls } as any)} />
          <label>Objectifs (un par ligne)
            <textarea rows={3} value={((editing as any).objectives || []).join("\n")} onChange={(e) => setEditing({ ...editing, objectives: e.target.value.split("\n").filter(Boolean) } as any)} />
          </label>
          <label>Compétences acquises (une par ligne)
            <textarea rows={3} value={((editing as any).skills || []).join("\n")} onChange={(e) => setEditing({ ...editing, skills: e.target.value.split("\n").filter(Boolean) } as any)} />
          </label>
          <div className="admin-actions">
            <button className="btn btn-primary" type="submit">Enregistrer</button>
            {editing.id && (
              <Link className="btn btn-outline" to={`/admin/formations/${editing.id}`}>Gérer modules & cours →</Link>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h1>Formations</h1>
        <button className="btn btn-primary" onClick={() => setEditing(EMPTY)}>+ Nouvelle formation</button>
      </div>
      {loading ? <div className="admin-empty">Chargement…</div> : items.length === 0 ? (
        <div className="admin-empty">Aucune formation pour l'instant. Crée la première avec le bouton ci-dessus.</div>
      ) : (
        <table className="admin-table">
          <thead><tr><th>Titre</th><th>Niveau</th><th>Prix</th><th>Statut</th><th></th></tr></thead>
          <tbody>
            {items.map((f) => (
              <tr key={f.id}>
                <td><b>{f.title}</b><br /><small style={{ color: "#94a3b8" }}>{f.slug}</small></td>
                <td>{LEVELS.find((l) => l.id === f.level)?.label ?? f.level}</td>
                <td>{f.price.toLocaleString("fr-FR")} {f.currency}</td>
                <td><span className={`admin-badge ${f.published ? "on" : "off"}`}>{f.published ? "Publiée" : "Brouillon"}</span></td>
                <td className="admin-actions">
                  <button className="btn btn-outline" onClick={() => setEditing(f)}>Modifier</button>
                  <Link className="btn btn-outline" to={`/admin/formations/${f.id}`}>Modules/Cours</Link>
                  <button className="btn btn-outline" onClick={() => togglePublish(f)}>{f.published ? "Dépublier" : "Publier"}</button>
                  <button className="btn btn-ghost" onClick={() => handleDelete(f)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
