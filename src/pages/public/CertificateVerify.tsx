import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import PublicLayout from "../../layouts/PublicLayout";

export default function CertificateVerify() {
  const { id } = useParams();
  const [cert, setCert] = useState<any>(null);
  const [status, setStatus] = useState<"loading" | "found" | "notfound">("loading");

  useEffect(() => { (async () => {
    const { data } = await supabase
      .from("certificates")
      .select("*, profiles(full_name), formations!certificates_formation_slug_fkey(title)")
      .or(`id.eq.${id},certificate_number.eq.${id}`)
      .maybeSingle();
    if (data) {
      setCert(data);
      setStatus("found");
      await supabase.from("certificate_verifications").insert({ certificate_id: data.id });
    } else setStatus("notfound");
  })(); }, [id]);

  return (
    <PublicLayout>
      <section className="page">
        <span className="eyebrow">VÉRIFICATION</span>
        <h1>Vérifier un certificat</h1>
        {status === "loading" && <p>Vérification…</p>}
        {status === "notfound" && <div className="admin-empty">Aucun certificat trouvé avec cet identifiant.</div>}
        {status === "found" && cert && (
          <div className="certificate">
            <div className="cert-brand">Tech Academia</div>
            <div className="cert-seal">✓</div>
            <h1>certificat valide, délivré à</h1>
            <div className="cert-name">{cert.profiles?.full_name || "Étudiant Tech Academia"}</div>
            <div className="cert-course">{cert.formations?.title ?? cert.formation_slug}</div>
            <div className="cert-meta">
              <span>N° <b>{cert.certificate_number}</b></span>
              <span>Délivré le <b>{new Date(cert.issued_at).toLocaleDateString("fr-FR")}</b></span>
            </div>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
