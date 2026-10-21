import { BarChart3, Clock, Wallet } from "lucide-react";

const LEVELS: Record<string, string> = {
  debutant: "Débutant", "débutant": "Débutant", intermediaire: "Intermédiaire", "intermédiaire": "Intermédiaire",
  avance: "Avancé", "avancé": "Avancé",
};

export function formatPrice(price?: number | null, currency?: string | null) {
  if (!price || price <= 0) return "Gratuit";
  const cur = !currency || currency === "XOF" ? "FCFA" : currency;
  return `${Number(price).toLocaleString("fr-FR")} ${cur}`;
}

export default function FormationMeta({ level, duration, price, currency }: {
  level?: string | null; duration?: string | null; price?: number | null; currency?: string | null;
}) {
  const lvl = level ? (LEVELS[level.toLowerCase()] ?? level) : null;
  return (
    <div className="meta-row">
      {lvl && <span className="meta-pill"><BarChart3 size={13} /> {lvl}</span>}
      {duration && <span className="meta-pill"><Clock size={13} /> {duration}</span>}
      <span className="meta-pill meta-price"><Wallet size={13} /> {formatPrice(price, currency)}</span>
    </div>
  );
}
