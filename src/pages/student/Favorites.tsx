import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import PublicLayout from "../../layouts/PublicLayout";
import { useAuth } from "../../context/AuthContext";

export default function Favorites() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => {
    if (!user) return;
    const { data } = await supabase.from("favorites").select("*, formations(title, slug, short_description, cover_image)").eq("user_id", user.id);
    setItems(data ?? []); setLoading(false);
  })(); }, [user]);
  return (
    <PublicLayout>
      <section className="page">
        <span className="eyebrow">FAVORIS</span>
        <h1>Mes favoris</h1>
        {loading ? <div className="admin-empty">Chargement…</div> : items.length === 0 ? (
          <div className="admin-empty">Aucun favori. Clique sur le ♥ d'une formation pour l'ajouter.</div>
        ) : (
          <div className="cards">
            {items.map((i) => (
              <div className="course-card" key={i.formation_id}>
                <div className="course-body"><h3>{i.formations?.title}</h3><p>{i.formations?.short_description}</p><Link to={`/formations/${i.formations?.slug}`}>Voir →</Link></div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
