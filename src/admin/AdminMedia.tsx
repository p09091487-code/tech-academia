import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { insertRow, deleteRow } from "../services/db";
import { useAuth } from "../context/AuthContext";

export default function AdminMedia() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const { data } = await supabase.from("media").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, []);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { alert("Erreur : " + error.message); setBusy(false); return; }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    await insertRow("media", { url: data.publicUrl, filename: file.name, uploaded_by: user?.id });
    setBusy(false);
    load();
  }

  async function copy(url: string) {
    await navigator.clipboard.writeText(url);
    alert("URL copiée !");
  }

  async function remove(item: any) {
    if (!confirm("Supprimer ce média ?")) return;
    await deleteRow("media", item.id);
    load();
  }

  return (
    <div>
      <div className="admin-toolbar">
        <h1>Médiathèque</h1>
        <button className="btn btn-primary" onClick={() => inputRef.current?.click()} disabled={busy}>{busy ? "Envoi…" : "+ Importer un fichier"}</button>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
      </div>
      {items.length === 0 ? (
        <div className="admin-empty">Aucun média importé. Les images utilisées dans les formations, articles et formateurs apparaîtront ici automatiquement.</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 14 }}>
          {items.map((m) => (
            <div key={m.id} style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
              <img src={m.url} alt={m.filename} style={{ width: "100%", height: 100, objectFit: "cover", display: "block" }} />
              <div style={{ padding: 8, fontSize: 12 }}>
                <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.filename}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <button className="btn btn-outline" style={{ padding: "3px 8px", fontSize: 11 }} onClick={() => copy(m.url)}>Copier l'URL</button>
                  <button className="btn btn-ghost" style={{ padding: "3px 8px", fontSize: 11 }} onClick={() => remove(m)}>Suppr.</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
