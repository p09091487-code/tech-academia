import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import PublicLayout from "../../layouts/PublicLayout";
import { useSeo } from "../../hooks/useSeo";
import { IMAGES } from "../../components/CourseVisual";

const ABOUT_FALLBACK = {
  title: "À propos de TECH ACADEMIA",
  intro: "TECH ACADEMIA est une plateforme de formation en ligne pensée pour apprendre les compétences numériques actuelles par la pratique, avec des cours structurés, des exercices, des évaluations et des certificats.",
  sections: [
    ["Notre mission", "Rendre les compétences numériques plus accessibles et transformer l'apprentissage en réalisations concrètes : développer, analyser, créer, publier et mesurer."],
    ["Une pédagogie orientée projet", "Chaque formation est organisée en modules et cours. Les apprenants travaillent sur des exercices pratiques, téléchargent les supports PDF et vérifient progressivement leurs acquis."],
    ["Des évaluations à chaque étape", "Des quiz intermédiaires permettent de vérifier la compréhension des modules. Une évaluation finale permet de valider l'ensemble d'une formation."],
    ["Progression et certificats", "Le parcours suit l'avancement de l'apprenant. Lorsque les conditions de réussite sont remplies, un certificat est généré et peut être vérifié depuis l'espace public de TECH ACADEMIA."],
    ["Pour les étudiants", "Depuis leur espace personnel, les étudiants peuvent retrouver leurs formations, suivre leur progression, terminer les cours, passer les quiz, réaliser leurs projets et consulter leurs certificats."],
    ["Pour les administrateurs", "L'espace d'administration permet de gérer les formations, modules, cours, contenus, quiz, étudiants, projets, certificats, pages et autres contenus de la plateforme."],
  ] as const,
};

export default function SitePage({ slug, fallbackTitle }: { slug: string; fallbackTitle: string }) {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => {
    const { data } = await supabase.from("site_pages").select("*").eq("slug", slug).maybeSingle();
    setPage(data); setLoading(false);
  })(); }, [slug]);
  useSeo(page?.seo_title || page?.title || fallbackTitle, page?.seo_description);

  if (slug === "a-propos" && !page) {
    return (
      <PublicLayout>
        <section className="about-page">
          <div className="about-hero">
            <div>
              <span className="eyebrow">TECH ACADEMIA · NOTRE PLATEFORME</span>
              <h1>{ABOUT_FALLBACK.title}</h1>
              <p>{ABOUT_FALLBACK.intro}</p>
              <div className="about-actions">
                <a className="btn btn-primary btn-lg" href="/formations">Découvrir les formations</a>
                <a className="btn btn-ghost btn-lg" href="/inscription">Créer mon compte</a>
              </div>
            </div>
            <div className="about-image-card">
              <img src={IMAGES.marketing} alt="Équipe travaillant ensemble sur un projet numérique" />
              <div><strong>Apprendre · Pratiquer · Réussir</strong><span>Une expérience pensée autour de la pratique.</span></div>
            </div>
          </div>
          <div className="about-grid">
            {ABOUT_FALLBACK.sections.map(([title, text]) => (
              <article className="about-card" key={title}><span>TECH ACADEMIA</span><h2>{title}</h2><p>{text}</p></article>
            ))}
          </div>
        </section>
      </PublicLayout>
    );
  }

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
