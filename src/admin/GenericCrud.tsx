import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { deleteRow, insertRow, updateRow } from "../services/db";
import ImagePicker from "../components/ImagePicker";

export interface FieldConfig {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "checkbox" | "select" | "image";
  options?: { value: string; label: string }[];
  full?: boolean;
}

export default function GenericCrud({
  table, title, fields, columns, order, emptyValues, publishField,
}: {
  table: string; title: string; fields: FieldConfig[]; columns: string[];
  order?: string; emptyValues: Record<string, any>; publishField?: string;
}) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  async function load() {
    setLoading(true);
    let q = supabase.from(table).select("*");
    if (order) q = q.order(order);
    const { data } = await q;
    setItems(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [table]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing.id) {
        const { id, created_at, updated_at, ...rest } = editing;
        await updateRow(table, editing.id, rest);
      } else {
        await insertRow(table, editing);
      }
      setEditing(null);
      load();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  }

  async function handleDelete(item: any) {
    if (!confirm("Supprimer cet élément ?")) return;
    await deleteRow(table, item.id);
    load();
  }

  async function togglePublish(item: any) {
    if (!publishField) return;
    await updateRow(table, item.id, { [publishField]: !item[publishField] });
    load();
  }

  if (editing) {
    return (
      <div>
        <div className="admin-toolbar">
          <h1>{editing.id ? `Modifier — ${title}` : `Nouveau — ${title}`}</h1>
          <button className="btn btn-ghost" onClick={() => setEditing(null)}>← Annuler</button>
        </div>
        <form className="admin-form" onSubmit={handleSave}>
          {fields.map((f) => (
            f.type === "image" ? (
              <ImagePicker key={f.name} label={f.label} value={editing[f.name] || ""} onChange={(url) => setEditing({ ...editing, [f.name]: url })} />
            ) :
            <label key={f.name}>
              {f.label}
              {f.type === "textarea" ? (
                <textarea rows={4} value={editing[f.name] ?? ""} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })} />
              ) : f.type === "checkbox" ? (
                <input type="checkbox" checked={!!editing[f.name]} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.checked })} style={{ width: 18 }} />
              ) : f.type === "select" ? (
                <select value={editing[f.name] ?? ""} onChange={(e) => setEditing({ ...editing, [f.name]: e.target.value })}>
                  {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input type={f.type === "number" ? "number" : "text"} value={editing[f.name] ?? ""} onChange={(e) => setEditing({ ...editing, [f.name]: f.type === "number" ? Number(e.target.value) : e.target.value })} />
              )}
            </label>
          ))}
          <button className="btn btn-primary" type="submit">Enregistrer</button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h1>{title}</h1>
        <button className="btn btn-primary" onClick={() => setEditing({ ...emptyValues })}>+ Ajouter</button>
      </div>
      {loading ? <div className="admin-empty">Chargement…</div> : items.length === 0 ? (
        <div className="admin-empty">Rien pour l'instant. Ajoute le premier élément.</div>
      ) : (
        <table className="admin-table">
          <thead><tr>{columns.map((c) => <th key={c}>{c}</th>)}<th></th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                {columns.map((c) => (
                  <td key={c}>
                    {typeof item[c] === "boolean"
                      ? <span className={`admin-badge ${item[c] ? "on" : "off"}`}>{item[c] ? "Oui" : "Non"}</span>
                      : String(item[c] ?? "").slice(0, 60)}
                  </td>
                ))}
                <td className="admin-actions">
                  <button className="btn btn-outline" onClick={() => setEditing(item)}>Modifier</button>
                  {publishField && (
                    <button className="btn btn-outline" onClick={() => togglePublish(item)}>{item[publishField] ? "Dépublier" : "Publier"}</button>
                  )}
                  <button className="btn btn-ghost" onClick={() => handleDelete(item)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
