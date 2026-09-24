import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { supabase } from "../../lib/supabase";
import PublicLayout from "../../layouts/PublicLayout";
import { useSeo } from "../../hooks/useSeo";
import FavoriteButton from "../../components/FavoriteButton";
import CourseVisual from "../../components/CourseVisual";

const LEVELS = [
  { id: "debutant", label: "Débutant" }, { id: "intermediaire", label: "Intermédiaire" }, { id: "avance", label: "Avancé" },
];
const PAGE_SIZE = 9;

export default function Catalog() {
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState(params.get("cat") || "");
  const [level, setLevel] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "price_asc" | "price_desc">("recent");
  const [page, setPage] = useState(1);

  useSeo("Toutes les formations", "Découvrez le catalogue complet des formations TECH ACADEMIA.");

  useEffect(() => { (async () => {
    const { data } = await supabase.from("formations").select("*, formation_categories(label)").eq("published", true).order("created_at", { ascending: false });
    setItems(data ?? []);
    const { data: c } = await supabase.from("formation_categories").select("*").order("position");
    setCategories(c ?? []);
    setLoading(false);
  })(); }, []);

  const filtered = useMemo(() => {
    let list = items;
    if (cat) list = list.filter((i) => i.category_id === cat);
    if (level) list = list.filter((i) => i.level === level);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((i) => i.title?.toLowerCase().includes(q) || i.short_description?.toLowerCase().includes(q) || i.subtitle?.toLowerCase().includes(q));
    }
    list = [...list];
    if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }, [items, cat, level, query, sort]);

  const visible = filtered.slice(0, page * PAGE_SIZE);

  function selectCat(id: string) {
    setCat(id); setPage(1);
    if (id) setParams({ cat: id }); else setParams({});
  }

  return (
    <PublicLayout>
      <section className="page">
        <span className="eyebrow">CATALOGUE</span>
        <h1>Toutes les formations</h1>

        <div style={{ display: "flex", gap: 10, margin: "18px 0", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 260px" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: 12, color: "#7f8aa5" }} />
            <input placeholder="Rechercher une formation…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} style={{ width: "100%", padding: "10px 12px 10px 34px" }} />
          </div>
          <select value={level} onChange={(e) => { setLevel(e.target.value); setPage(1); }}>
            <option value="">Tous niveaux</option>
            {LEVELS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as any)}>
            <option value="recent">Plus récentes</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}>
          <button className={`chip ${!cat ? "on" : ""}`} onClick={() => selectCat("")}>Toutes</button>
          {categories.map((c) => (
            <button key={c.id} className={`chip ${cat === c.id ? "on" : ""}`} onClick={() => selectCat(c.id)}>{c.label}</button>
          ))}
        </div>

        {loading ? (
          <div className="admin-empty">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">Aucune formation ne correspond à ta recherche.</div>
        ) : (
          <>
            <div className="cards">
              {visible.map((f) => (
                <article className="course-card" key={f.id} style={{ position: "relative" }}>
                  <FavoriteButton formationId={f.id} />
                  <CourseVisual title={f.title} category={f.formation_categories?.label} imageUrl={f.cover_image} />
                  <div className="course-body">
                    <span className="tag">{f.formation_categories?.label || "Formation"}</span>
                    <h3>{f.title}</h3>
                    <p>{f.short_description || f.subtitle}</p>
                    <Link to={`/formations/${f.slug}`}>Découvrir →</Link>
                  </div>
                </article>
              ))}
            </div>
            {visible.length < filtered.length && (
              <div style={{ textAlign: "center", marginTop: 30 }}>
                <button className="btn btn-outline btn-lg" onClick={() => setPage(page + 1)}>Voir plus de formations</button>
              </div>
            )}
          </>
        )}
      </section>
    </PublicLayout>
  );
}
