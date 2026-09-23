import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import PublicLayout from "../../layouts/PublicLayout";

export default function FaqPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => {
    const { data } = await supabase.from("faqs").select("*").eq("published", true).order("position");
    setItems(data ?? []); setLoading(false);
  })(); }, []);
  return (
    <PublicLayout>
      <section className="page">
        <span className="eyebrow">FAQ</span>
        <h1>Questions fréquentes</h1>
        {loading ? <div className="admin-empty">Chargement…</div> : items.length === 0 ? (
          <div className="admin-empty">Aucune question pour l'instant.</div>
        ) : items.map((f) => (
          <details className="faq-item" key={f.id}><summary>{f.question}</summary><p>{f.answer}</p></details>
        ))}
      </section>
    </PublicLayout>
  );
}
