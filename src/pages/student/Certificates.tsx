import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import PublicLayout from "../../layouts/PublicLayout";
import { useAuth } from "../../context/AuthContext";

export default function Certificates() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => {
    if (!user) return;
    const { data } = await supabase.from("certificates").select("*").eq("user_id", user.id);
    setItems(data ?? []); setLoading(false);
  })(); }, [user]);

  return (
    <PublicLayout>
      <section className="page">
        <span className="eyebrow">CERTIFICATS</span>
        <h1>Mes certificats</h1>
        {loading ? <div className="admin-empty">Chargement…</div> : items.length === 0 ? (
          <div className="admin-empty">Tu n'as pas encore de certificat.</div>
        ) : (
          <div className="cards">
            {items.map((c) => (
              <div className="course-card" key={c.id}>
                <div className="course-body">
                  <h3>{c.formation_slug}</h3>
                  <p>N° {c.certificate_number}</p>
                  <Link to={`/verification-certificat/${c.certificate_number}`}>Voir la vérification →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
