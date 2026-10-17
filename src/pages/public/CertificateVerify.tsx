import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import PublicLayout from "../../layouts/PublicLayout";

type Verified = {
  cert_number: string;
  cert_issued_at: string;
  holder_name: string | null;
  formation_title: string | null;
};

export default function CertificateVerify() {
  const { id } = useParams();
  const [cert, setCert] = useState<Verified | null>(null);
  const [status, setStatus] = useState<"loading" | "found" | "notfound">("loading");

  useEffect(() => { (async () => {
    const { data, error } = await supabase.rpc("verify_certificate", { p_code: id ?? "" });
    const row = Array.isArray(data) ? data[0] : data;
    if (!error && row) { setCert(row as Verified); setStatus("found"); }
    else setStatus("notfound");
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
            <div className="cert-name">{cert.holder_name || "Étudiant Tech Academia"}</div>
            <div className="cert-course">{cert.formation_title}</div>
            <div className="cert-meta">
              <span>N° <b>{cert.cert_number}</b></span>
              <span>Délivré le <b>{new Date(cert.cert_issued_at).toLocaleDateString("fr-FR")}</b></span>
            </div>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
