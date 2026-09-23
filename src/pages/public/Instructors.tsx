import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import PublicLayout from "../../layouts/PublicLayout";
import { useSeo } from "../../hooks/useSeo";

export default function InstructorsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useSeo("Nos formateurs", "L'équipe pédagogique de TECH ACADEMIA.");
  useEffect(() => { (async () => {
    const { data } = await supabase.from("instructors").select("*");
    setItems(data ?? []); setLoading(false);
  })(); }, []);
  return (
    <PublicLayout>
      <section className="page">
        <span className="eyebrow">ÉQUIPE</span>
        <h1>Nos formateurs</h1>
        {loading ? <div className="admin-empty">Chargement…</div> : items.length === 0 ? (
          <div className="admin-empty">Les formateurs seront présentés ici.</div>
        ) : (
          <div className="cards">
            {items.map((i) => (
              <div className="course-card" key={i.id}>
                <div className="course-image" style={i.avatar_url ? { backgroundImage: `url(${i.avatar_url})`, backgroundSize: "cover" } : undefined}>{!i.avatar_url && <span>{i.full_name?.[0]}</span>}</div>
                <div className="course-body"><h3>{i.full_name}</h3><span className="tag">{i.role_title}</span><p>{i.bio}</p></div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
