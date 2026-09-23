import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import PublicLayout from "../../layouts/PublicLayout";
import { useSeo } from "../../hooks/useSeo";

export function BlogList() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => {
    const { data } = await supabase.from("blog_posts").select("*").eq("status", "published").order("published_at", { ascending: false });
    setPosts(data ?? []); setLoading(false);
  })(); }, []);
  return (
    <PublicLayout>
      <section className="page">
        <span className="eyebrow">BLOG</span>
        <h1>Actualités & articles</h1>
        {loading ? <div className="admin-empty">Chargement…</div> : posts.length === 0 ? (
          <div className="admin-empty">Aucun article publié pour l'instant.</div>
        ) : (
          <div className="cards">
            {posts.map((p) => (
              <article className="course-card" key={p.id}>
                <div className="course-image" style={p.cover_image ? { backgroundImage: `url(${p.cover_image})`, backgroundSize: "cover" } : undefined}>{!p.cover_image && <span>TECH ACADEMIA</span>}</div>
                <div className="course-body"><span className="tag">{p.category || "Article"}</span><h3>{p.title}</h3><p>{p.excerpt}</p><Link to={`/blog/${p.slug}`}>Lire →</Link></div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}

export function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => {
    const { data } = await supabase.from("blog_posts").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
    setPost(data); setLoading(false);
  })(); }, [slug]);
  useSeo(post?.seo_title || post?.title, post?.seo_description || post?.excerpt);

  if (loading) return <PublicLayout><div className="admin-empty">Chargement…</div></PublicLayout>;
  if (!post) return <PublicLayout><section className="page"><h1>Article introuvable</h1></section></PublicLayout>;
  return (
    <PublicLayout>
      <section className="page">
        <span className="eyebrow">{post.category || "Article"}</span>
        <h1>{post.title}</h1>
        <p style={{ whiteSpace: "pre-line" }}>{post.content}</p>
      </section>
    </PublicLayout>
  );
}
