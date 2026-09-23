import { useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { insertRow } from "../services/db";
import { useAuth } from "../context/AuthContext";

export default function ImagePicker({ value, onChange, label }: { value: string; onChange: (url: string) => void; label: string }) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { alert("Erreur upload : " + error.message); setBusy(false); return; }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    onChange(data.publicUrl);
    try { await insertRow("media", { url: data.publicUrl, filename: file.name, uploaded_by: user?.id }); } catch {}
    setBusy(false);
  }

  return (
    <label>
      {label}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="https://... ou importe un fichier" style={{ flex: 1 }} />
        <button type="button" className="btn btn-outline" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? "Envoi…" : "Importer"}
        </button>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
      </div>
      {value && <img src={value} alt="" style={{ maxHeight: 80, marginTop: 6, borderRadius: 8 }} />}
    </label>
  );
}
