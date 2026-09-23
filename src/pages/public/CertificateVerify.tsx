import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import PublicLayout from "../../layouts/PublicLayout";

export default function CertificateVerify() {
  const { id } = useParams();
  const [cert, setCert] = useState<any>(null);
  const [status, setStatus] = useState<"loading" | "found" | "notfound">("loading");

  useEffect(() => { (async () => {
    const { data } = await supabase.from("certificates").select("*, profiles(full_name)").or(`id.eq.${id},certificate_number.eq.${id}`).maybeSingle();
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
          <div className="buy-box" style={{ maxWidth: 480 }}>
            <p>✅ Certificat valide</p>
            <p><b>{cert.profiles?.full_name}</b></p>
            <p>Formation : {cert.formation_slug}</p>
            <p>N° : {cert.certificate_number}</p>
            <p>Délivré le {new Date(cert.issued_at).toLocaleDateString("fr-FR")}</p>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
