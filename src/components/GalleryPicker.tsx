import { useRef, useState } from "react";
import { supabase } from "../lib/supabase";

export default function GalleryPicker({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const path = `gallery-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { error } = await supabase.storage.from("media").upload(path, file);
    if (error) { alert("Erreur : " + error.message); setBusy(false); return; }
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    onChange([...(value || []), data.publicUrl]);
    setBusy(false);
  }
  function remove(url: string) { onChange((value || []).filter((u) => u !== url)); }

  return (
    <label>
      Galerie photo
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
        {(value || []).map((url) => (
          <div key={url} style={{ position: "relative" }}>
            <img src={url} alt="" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 8 }} />
            <button type="button" onClick={() => remove(url)} style={{ position: "absolute", top: -6, right: -6, background: "#ef4444", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 12, cursor: "pointer" }}>×</button>
          </div>
        ))}
        <button type="button" className="btn btn-outline" onClick={() => inputRef.current?.click()} disabled={busy} style={{ width: 72, height: 72 }}>{busy ? "…" : "+ Ajouter"}</button>
        <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFile} />
      </div>
    </label>
  );
}
