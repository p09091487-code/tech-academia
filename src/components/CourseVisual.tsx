const IMAGES = {
  coding: "https://images.pexels.com/photos/574077/pexels-photo-574077.jpeg?auto=compress&cs=tinysrgb&w=1600",
  programming: "https://images.pexels.com/photos/4974912/pexels-photo-4974912.jpeg?auto=compress&cs=tinysrgb&w=1600",
  ai: "https://images.pexels.com/photos/9028874/pexels-photo-9028874.jpeg?auto=compress&cs=tinysrgb&w=1600",
  data: "https://images.pexels.com/photos/3861957/pexels-photo-3861957.jpeg?auto=compress&cs=tinysrgb&w=1600",
  marketing: "https://images.pexels.com/photos/3183174/pexels-photo-3183174.jpeg?auto=compress&cs=tinysrgb&w=1600",
  strategy: "https://images.pexels.com/photos/6476252/pexels-photo-6476252.jpeg?auto=compress&cs=tinysrgb&w=1600",
  code: "https://images.pexels.com/photos/5474282/pexels-photo-5474282.jpeg?auto=compress&cs=tinysrgb&w=1600",
  analytics: "https://images.pexels.com/photos/12969403/pexels-photo-12969403.jpeg?auto=compress&cs=tinysrgb&w=1600",
};

function pickImage(value = "") {
  const text = value.toLowerCase();
  if (/ia|intelligence|machine|prompt|générative|robot/.test(text)) return IMAGES.ai;
  if (/data|python|statistique|analytics|analyse/.test(text)) return IMAGES.data;
  if (/marketing|seo|publicité|audience|copywriting|réseaux|contenu|conversion/.test(text)) return IMAGES.marketing;
  if (/stratégie|strategy|business|entreprise|projet/.test(text)) return IMAGES.strategy;
  if (/javascript|react|html|css|api|développement|programming/.test(text)) return IMAGES.programming;
  if (/git|test|déploiement|sécurité|cyber/.test(text)) return IMAGES.code;
  if (/dashboard|tableau|mesure|performance/.test(text)) return IMAGES.analytics;
  return IMAGES.coding;
}

export default function CourseVisual({ title, category, imageUrl, compact = false }: { title?: string; category?: string; imageUrl?: string | null; compact?: boolean }) {
  // Prefer a real photo stored on the formation. Reject the old generated SVG/data-URI artwork.
  const supplied = imageUrl && !imageUrl.startsWith("data:image/svg+xml") ? imageUrl : undefined;
  const image = supplied || pickImage(`${category ?? ""} ${title ?? ""}`);
  const label = category || "TECH ACADEMIA";

  return (
    <div className={`course-visual ${compact ? "course-visual-compact" : ""}`}>
      <img className="course-photo" src={image} alt={title || label} loading="lazy" referrerPolicy="no-referrer" />
      <div className="course-photo-overlay" />
      <div className="photo-badge">{label}</div>
      <div className="photo-caption">
        <span>FORMATION PRATIQUE</span>
        <strong>{title || "TECH ACADEMIA"}</strong>
      </div>
    </div>
  );
}

export { IMAGES };
