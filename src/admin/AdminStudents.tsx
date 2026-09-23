import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { updateRow } from "../services/db";

interface Profile { id: string; full_name: string | null; role: string; phone: string | null; city: string | null; created_at: string; }

export default function AdminStudents() {
  const [items, setItems] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollCounts, setEnrollCounts] = useState<Record<string, number>>({});

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setItems((data ?? []) as Profile[]);
    const { data: enr } = await supabase.from("enrollments").select("user_id");
    const counts: Record<string, number> = {};
    (enr ?? []).forEach((e: any) => { counts[e.user_id] = (counts[e.user_id] || 0) + 1; });
    setEnrollCounts(counts);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function changeRole(p: Profile, role: string) {
    await updateRow("profiles", p.id, { role });
    load();
  }

  return (
    <div>
      <h1>Étudiants</h1>
      {loading ? <div className="admin-empty">Chargement…</div> : items.length === 0 ? (
        <div className="admin-empty">Aucun compte enregistré.</div>
      ) : (
        <table className="admin-table">
          <thead><tr><th>Nom</th><th>Rôle</th><th>Formations suivies</th><th>Inscrit le</th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id}>
                <td>{p.full_name || "—"}</td>
                <td>
                  <select value={p.role} onChange={(e) => changeRole(p, e.target.value)}>
                    <option value="STUDENT">Étudiant</option>
                    <option value="FORMATEUR">Formateur</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td>{enrollCounts[p.id] ?? 0}</td>
                <td>{new Date(p.created_at).toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
