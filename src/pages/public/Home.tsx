import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import CourseVisual, { IMAGES } from "../../components/CourseVisual";
import { supabase } from "../../lib/supabase";
import PublicLayout from "../../layouts/PublicLayout";
import { useSeo } from "../../hooks/useSeo";

export default function Home() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => { (async () => {
    const { data: s } = await supabase.from("site_settings").select("*");
    const map: Record<string, string> = {};
    (s ?? []).forEach((r: any) => { map[r.key] = r.value?.text ?? ""; });
    setSettings(map);
    const { data: c } = await supabase.from("formation_categories").select("*").order("position");
    setCategories(c ?? []);
    const { data: f } = await supabase.from("formations").select("*, formation_categories(label)").eq("published", true).order("created_at", { ascending: false }).limit(6);
    setPopular(f ?? []);
    const { data: t } = await supabase.from("testimonials").select("*").eq("published", true).order("position");
    setTestimonials(t ?? []);
  })(); }, []);

  useSeo("Accueil", settings.hero_subtitle || "Formations pratiques en technologie et intelligence artificielle.");

  return (
    <PublicLayout>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">APPRENDRE • PRATIQUER • CRÉER</span>
          <h1>{settings.hero_title || "Développez les compétences qui façonnent demain."}</h1>
          <p>{settings.hero_subtitle || "Des formations pratiques en technologie, développement et intelligence artificielle."}</p>
          <div className="hero-actions">
            <Link className="btn btn-primary btn-lg" to="/formations">Explorer les formations <ArrowRight size={18} /></Link>
            <Link className="btn btn-ghost btn-lg" to="/a-propos">Découvrir TECH ACADEMIA</Link>
          </div>
          <div className="stats">
            <span><b>{popular.length}+</b><small>Formations</small></span>
            <span><b>{categories.length}</b><small>Domaines</small></span>
            <span><b>24/7</b><small>Accès</small></span>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-visual-shell">
            <div className="hero-visual-backdrop" />
            <div className="hero-visual-card hero-photo-card">
              <img src={IMAGES.coding} alt="Étudiant en train de coder sur ordinateur" />
              <div className="hero-photo-shade" />
              <div className="hero-visual-top"><span>TECH ACADEMIA / 2026</span><span className="live-dot"><i /> APPRENTISSAGE</span></div>
              <div className="hero-visual-bottom"><span>APPRENDRE EN PRATIQUE</span><strong>Des compétences.<br />Des projets.<br /><em>Des résultats.</em></strong></div>
            </div>
            <div className="float-card"><ShieldCheck size={20} /> Parcours pratique <b>24/7</b></div>
            <div className="hero-mini-card mini-one"><span>01</span><b>COURS</b><small>+ pratique</small></div>
            <div className="hero-mini-card mini-two"><span>02</span><b>QUIZ</b><small>validation</small></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head"><div><span className="eyebrow">NOS DOMAINES</span><h2>Apprenez avec des parcours orientés pratique.</h2></div><Link to="/formations">Voir tout <ArrowRight size={16} /></Link></div>
        {categories.length === 0 ? (
          <div className="admin-empty">Les domaines de formation apparaîtront ici une fois créés depuis l'admin.</div>
        ) : (
          <div className="cards">
            {categories.map((c) => (
              <Link key={c.id} to={`/formations?cat=${c.id}`} className="course-card" style={{ textDecoration: "none", color: "inherit" }}>
                <CourseVisual title={c.label} category={c.label} />
                <div className="course-body"><h3>{c.label}</h3><p>{c.description}</p></div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-head"><div><span className="eyebrow">CATALOGUE</span><h2>Formations récentes</h2></div><Link to="/formations">Voir tout <ArrowRight size={16} /></Link></div>
        {popular.length === 0 ? (
          <div className="admin-empty">Aucune formation publiée pour l'instant.</div>
        ) : (
          <div className="cards">
            {popular.map((f) => (
              <article className="course-card" key={f.id}>
                <CourseVisual title={f.title} category={f.formation_categories?.label} imageUrl={f.cover_image} />
                <div className="course-body"><span className="tag">{f.formation_categories?.label || "Formation"}</span><h3>{f.title}</h3><p>{f.short_description}</p><Link to={`/formations/${f.slug}`}>Découvrir →</Link></div>
              </article>
            ))}
          </div>
        )}
      </section>

      {testimonials.length > 0 && (
        <section className="section">
          <div className="section-head"><div><span className="eyebrow">TÉMOIGNAGES</span><h2>Ce que disent nos étudiants</h2></div></div>
          <div className="cards">
            {testimonials.map((t) => (
              <div className="course-card testimonial-card" key={t.id}>
                <div className="course-body">
                  <p style={{ fontStyle: "italic" }}>"{t.quote}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
                    {t.avatar_url ? <img src={t.avatar_url} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} /> : <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#312e81" }} />}
                    <div><b style={{ display: "block" }}>{t.author_name}</b><span style={{ fontSize: 12, color: "#7f8aa5" }}>{t.author_role}</span></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
