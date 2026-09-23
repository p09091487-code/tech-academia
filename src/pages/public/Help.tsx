import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import PublicLayout from "../../layouts/PublicLayout";

export default function HelpPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => {
    const { data } = await supabase.from("help_articles").select("*").eq("published", true).order("position");
    setItems(data ?? []); setLoading(false);
  })(); }, []);
  return (
    <PublicLayout>
      <section className="page">
        <span className="eyebrow">CENTRE D'AIDE</span>
        <h1>Aide & guides</h1>
        {loading ? <div className="admin-empty">Chargement…</div> : items.length === 0 ? (
          <div className="admin-empty">Aucun article d'aide pour l'instant.</div>
        ) : items.map((a) => (
          <div key={a.id} style={{ marginBottom: 20 }}>
            <h3>{a.title}</h3><p style={{ whiteSpace: "pre-line" }}>{a.content}</p>
          </div>
        ))}
      </section>
    </PublicLayout>
  );
}
