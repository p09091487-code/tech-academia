import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import PublicLayout from "../../layouts/PublicLayout";
import CourseVisual from "../../components/CourseVisual";
import { useAuth } from "../../context/AuthContext";
import { useSeo } from "../../hooks/useSeo";

export default function FormationDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formation, setFormation] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [courses, setCourses] = useState<Record<string, any[]>>({});
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [similar, setSimilar] = useState<any[]>([]);
  const [openModule, setOpenModule] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: f } = await supabase.from("formations").select("*, formation_categories(label), instructors(full_name, bio, avatar_url)").eq("slug", slug).maybeSingle();
      setFormation(f);
      if (f) {
        const { data: mods } = await supabase.from("modules").select("*").eq("formation_id", f.id).eq("published", true).order("position");
        setModules(mods ?? []);
        setOpenModule(mods?.[0]?.id ?? null);
        const modIds = (mods ?? []).map((m: any) => m.id);
        if (modIds.length) {
          const { data: crs } = await supabase.from("courses").select("*").in("module_id", modIds).eq("published", true).order("position");
          const grouped: Record<string, any[]> = {};
          for (const c of crs ?? []) { grouped[c.module_id] = grouped[c.module_id] || []; grouped[c.module_id].push(c); }
          setCourses(grouped);
        }
        if (user) {
          const { data: enr } = await supabase.from("enrollments").select("id").eq("user_id", user.id).eq("formation_slug", f.slug).maybeSingle();
          setEnrolled(!!enr);
        }
        if (f.category_id) {
          const { data: sim } = await supabase.from("formations").select("*").eq("category_id", f.category_id).eq("published", true).neq("id", f.id).limit(3);
          setSimilar(sim ?? []);
        }
      }
      setLoading(false);
    })();
  }, [slug, user]);

  async function handleEnroll() {
    if (!user) { navigate("/connexion"); return; }
    await supabase.from("enrollments").insert({ user_id: user.id, formation_slug: formation.slug, payment_status: "paid" });
    await supabase.from("notifications").insert({ user_id: user.id, title: "Inscription confirmée", body: `Tu es inscrit(e) à "${formation.title}". Bon apprentissage !` });
    setEnrolled(true);
  }

  useSeo(formation?.seo_title || formation?.title, formation?.seo_description || formation?.short_description);

  if (loading) return <PublicLayout><div className="admin-empty">Chargement…</div></PublicLayout>;
  if (!formation) return <PublicLayout><section className="page"><h1>Formation introuvable</h1></section></PublicLayout>;

  const totalCourses = Object.values(courses).reduce((n, arr) => n + arr.length, 0);

  return (
    <PublicLayout>
      <section className="page">
        <span className="eyebrow">{formation.formation_categories?.label || "Formation"}</span>
        <h1>{formation.title}</h1>
        <p>{formation.subtitle}</p>
        <div style={{ marginTop: 20, borderRadius: 22, overflow: "hidden", border: "1px solid #ffffff14" }}>
          <CourseVisual title={formation.title} category={formation.formation_categories?.label} imageUrl={formation.cover_image} />
        </div>
        <div className="detail-grid" style={{ marginTop: 24 }}>
          <div>
            <h2>Présentation</h2>
            <p style={{ whiteSpace: "pre-line" }}>{formation.description}</p>

            {formation.objectives?.length > 0 && (
              <>
                <h2>Objectifs</h2>
                <ul>{formation.objectives.map((o: string, i: number) => <li key={i}>{o}</li>)}</ul>
              </>
            )}

            <h2>Programme ({modules.length} modules · {totalCourses} cours)</h2>
            <div style={{ display: "grid", gap: 12 }}>
              {modules.map((m, i) => (
                <div className="module-card" key={m.id}>
                  <button className="m-head" onClick={() => setOpenModule(openModule === m.id ? null : m.id)}>
                    <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {m.image_url && <img src={m.image_url} alt="" style={{ width: 44, height: 32, objectFit: "cover", borderRadius: 6 }} />}
                      <span><b>Module {i + 1}.</b> {m.title}</span>
                    </span>
                    <span>{(courses[m.id] ?? []).length} cours</span>
                  </button>
                  {openModule === m.id && (
                    <div className="m-body">
                      {(courses[m.id] ?? []).map((c) => (
                        <div className="m-lesson" key={c.id}>
                          {c.image_url ? <img src={c.image_url} alt="" style={{ width: 42, height: 30, objectFit: "cover", borderRadius: 6 }} /> : <span>▶</span>}
                          <span>{c.title}</span><span className="len">{c.duration}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {modules.length === 0 && <p style={{ color: "#94a3b8" }}>Le programme sera bientôt disponible.</p>}
            </div>

            {formation.skills?.length > 0 && (
              <>
                <h2>Compétences acquises</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {formation.skills.map((s: string, i: number) => <span key={i} className="chip">{s}</span>)}
                </div>
              </>
            )}

            {formation.gallery_images?.length > 0 && (
              <>
                <h2>Galerie</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 10 }}>
                  {formation.gallery_images.map((url: string, i: number) => (
                    <img key={i} src={url} alt="" style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 10 }} />
                  ))}
                </div>
              </>
            )}

            {formation.faq?.length > 0 && (
              <>
                <h2>FAQ</h2>
                {formation.faq.map((f: any, i: number) => (
                  <details className="faq-item" key={i}><summary>{f.q}</summary><p>{f.a}</p></details>
                ))}
              </>
            )}
          </div>

          <div className="buy-box">
            <div className="price">{Number(formation.price).toLocaleString("fr-FR")} {formation.currency}</div>
            {enrolled ? (
              <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={() => navigate("/dashboard")}>Continuer la formation</button>
            ) : (
              <button className="btn btn-primary btn-lg" style={{ width: "100%" }} onClick={handleEnroll}>S'inscrire</button>
            )}
            <p style={{ fontSize: 13, color: "#64748b", marginTop: 12 }}>Niveau : {formation.level} · Durée : {formation.duration || "—"}</p>
            {formation.instructors && (
              <div style={{ marginTop: 16, borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
                <b>{formation.instructors.full_name}</b>
                <p style={{ fontSize: 13, color: "#64748b" }}>{formation.instructors.bio}</p>
              </div>
            )}
          </div>
        </div>

        {similar.length > 0 && (
          <div className="section-head" style={{ marginTop: 60 }}>
            <div><span className="eyebrow">À DÉCOUVRIR AUSSI</span><h2>Formations similaires</h2></div>
          </div>
        )}
        {similar.length > 0 && (
          <div className="cards">
            {similar.map((s) => (
              <a key={s.id} href={`/formations/${s.slug}`} className="course-card" style={{ textDecoration: "none", color: "inherit" }}>
                <div className="course-image" style={s.cover_image ? { backgroundImage: `url(${s.cover_image})`, backgroundSize: "cover" } : undefined}>{!s.cover_image && <span>TECH ACADEMIA</span>}</div>
                <div className="course-body"><h3>{s.title}</h3><p>{s.short_description}</p></div>
              </a>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
