import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { deleteRow, insertRow, updateRow } from "../services/db";

export default function AdminNavigation() {
  const [items, setItems] = useState<any[]>([]);
  const [zone, setZone] = useState<"header" | "footer">("header");
  const [form, setForm] = useState({ label: "", url: "" });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("site_navigation").select("*").order("position");
    setItems(data ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!form.label.trim() || !form.url.trim()) return;
    const count = items.filter((i) => i.zone === zone).length;
    await insertRow("site_navigation", { zone, label: form.label, url: form.url, position: count });
    setForm({ label: "", url: "" });
    load();
  }
  async function remove(id: string) { await deleteRow("site_navigation", id); load(); }
  async function move(item: any, dir: -1 | 1) {
    const siblings = items.filter((i) => i.zone === item.zone);
    const idx = siblings.findIndex((s) => s.id === item.id);
    const swap = siblings[idx + dir];
    if (!swap) return;
    await updateRow("site_navigation", item.id, { position: swap.position });
    await updateRow("site_navigation", swap.id, { position: item.position });
    load();
  }

  const list = items.filter((i) => i.zone === zone);

  return (
    <div>
      <h1>Navigation</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <button className={`chip ${zone === "header" ? "on" : ""}`} onClick={() => setZone("header")}>En-tête</button>
        <button className={`chip ${zone === "footer" ? "on" : ""}`} onClick={() => setZone("footer")}>Pied de page</button>
      </div>
      <form onSubmit={add} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <input placeholder="Libellé (ex: Formations)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} style={{ padding: 8, border: "1px solid #cbd5e1", borderRadius: 8 }} />
        <input placeholder="Lien (ex: /formations)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} style={{ padding: 8, border: "1px solid #cbd5e1", borderRadius: 8, flex: 1 }} />
        <button className="btn btn-primary" type="submit">+ Ajouter</button>
      </form>
      {loading ? <div className="admin-empty">Chargement…</div> : list.length === 0 ? (
        <div className="admin-empty">Aucun lien pour cette zone (les liens par défaut du site restent affichés).</div>
      ) : (
        <table className="admin-table">
          <tbody>
            {list.map((item, idx) => (
              <tr key={item.id}>
                <td>{item.label}</td><td>{item.url}</td>
                <td className="admin-actions">
                  <button className="btn btn-outline" onClick={() => move(item, -1)} disabled={idx === 0}>↑</button>
                  <button className="btn btn-outline" onClick={() => move(item, 1)} disabled={idx === list.length - 1}>↓</button>
                  <button className="btn btn-ghost" onClick={() => remove(item.id)}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
