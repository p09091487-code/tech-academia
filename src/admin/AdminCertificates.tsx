import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { insertRow } from "../services/db";

export default function AdminCertificates() {
  const [items, setItems] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [formations, setFormations] = useState<any[]>([]);
  const [form, setForm] = useState({ user_id: "", formation_slug: "" });
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("certificates").select("*, profiles(full_name)").order("issued_at", { ascending: false });
    setItems(data ?? []);
    const { data: s } = await supabase.from("profiles").select("id, full_name").eq("role", "STUDENT");
    setStudents(s ?? []);
    const { data: f } = await supabase.from("formations").select("slug, title");
    setFormations(f ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function issue(e: React.FormEvent) {
    e.preventDefault();
    if (!form.user_id || !form.formation_slug) return;
    const certNumber = "TA-" + Date.now().toString(36).toUpperCase();
    try {
      await insertRow("certificates", { user_id: form.user_id, formation_slug: form.formation_slug, certificate_number: certNumber });
      await insertRow("notifications", { user_id: form.user_id, title: "Certificat délivré 🎓", body: `Ton certificat pour "${form.formation_slug}" est disponible.` });
      setForm({ user_id: "", formation_slug: "" });
      load();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  }

  return (
    <div>
      <h1>Certificats</h1>
      <form className="admin-form" onSubmit={issue} style={{ marginBottom: 28 }}>
        <h2 style={{ margin: 0, fontSize: 15 }}>Délivrer un certificat manuellement</h2>
        <div className="admin-form-row">
          <label>Étudiant
            <select value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })}>
              <option value="">— Choisir —</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.full_name || s.id}</option>)}
            </select>
          </label>
          <label>Formation
            <select value={form.formation_slug} onChange={(e) => setForm({ ...form, formation_slug: e.target.value })}>
              <option value="">— Choisir —</option>
              {formations.map((f) => <option key={f.slug} value={f.slug}>{f.title}</option>)}
            </select>
          </label>
        </div>
        <button className="btn btn-primary" type="submit">Délivrer le certificat</button>
      </form>

      {loading ? <div className="admin-empty">Chargement…</div> : items.length === 0 ? (
        <div className="admin-empty">Aucun certificat délivré pour l'instant.</div>
      ) : (
        <table className="admin-table">
          <thead><tr><th>N° certificat</th><th>Étudiant</th><th>Formation</th><th>Date</th></tr></thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.certificate_number}</td>
                <td>{c.profiles?.full_name || "—"}</td>
                <td>{c.formation_slug}</td>
                <td>{new Date(c.issued_at).toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
