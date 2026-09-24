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
    const { data } = await supabase
      .from("certificates")
      .select("*, formations!certificates_formation_slug_fkey(title)")
      .eq("user_id", user.id)
      .order("issued_at", { ascending: false });
    setItems(data ?? []); setLoading(false);
  })(); }, [user]);

  return (
    <PublicLayout>
      <section className="page">
        <span className="eyebrow">CERTIFICATS</span>
        <h1>Mes certificats</h1>
        {loading ? <div className="admin-empty">Chargement…</div> : items.length === 0 ? (
          <div className="admin-empty">Tu n'as pas encore de certificat. Termine tous les cours d'une formation et réussis son évaluation finale pour en débloquer un.</div>
        ) : (
          items.map((c) => (
            <div className="certificate" key={c.id}>
              <div className="cert-brand">Tech Academia</div>
              <div className="cert-seal">✓</div>
              <h1>certifie que</h1>
              <div className="cert-name">{c.formations?.title ?? c.formation_slug}</div>
              <div className="cert-course">a été complétée avec succès</div>
              <div className="cert-meta">
                <span>N° <b>{c.certificate_number}</b></span>
                <span>Délivré le <b>{new Date(c.issued_at).toLocaleDateString("fr-FR")}</b></span>
              </div>
              <div className="cert-actions">
                <button className="btn-primary" onClick={() => window.print()}>Télécharger / Imprimer</button>
                <Link className="btn-ghost" to={`/verification-certificat/${c.certificate_number}`}>Page de vérification</Link>
              </div>
            </div>
          ))
        )}
      </section>
    </PublicLayout>
  );
}
