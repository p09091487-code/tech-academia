import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import PublicLayout from "../../layouts/PublicLayout";
import { useSeo } from "../../hooks/useSeo";

export default function SitePage({ slug, fallbackTitle }: { slug: string; fallbackTitle: string }) {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => {
    const { data } = await supabase.from("site_pages").select("*").eq("slug", slug).maybeSingle();
    setPage(data); setLoading(false);
  })(); }, [slug]);
  useSeo(page?.seo_title || page?.title || fallbackTitle, page?.seo_description);

  return (
    <PublicLayout>
      <section className="page">
        <span className="eyebrow">TECH ACADEMIA</span>
        <h1>{page?.title || fallbackTitle}</h1>
        {loading ? null : (
          <p style={{ whiteSpace: "pre-line" }}>{page?.content || "Cette page sera bientôt renseignée depuis l'espace admin."}</p>
        )}
      </section>
    </PublicLayout>
  );
}
