import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const DEFAULTS = {
  hero_title: "Développez les compétences qui façonnent demain.",
  hero_subtitle: "Des formations pratiques en technologie, développement et intelligence artificielle.",
  stat_courses: "0", stat_formations: "0", stat_access: "24/7",
  footer_tagline: "Apprenez. Créez. Progressez.",
  footer_copyright: `© ${new Date().getFullYear()} TECH ACADEMIA. Tous droits réservés.`,
  contact_email: "", contact_phone: "",
};

export default function AdminSettings() {
  const [values, setValues] = useState<Record<string, string>>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("site_settings").select("*");
      const map: Record<string, string> = { ...DEFAULTS };
      (data ?? []).forEach((row: any) => { map[row.key] = row.value?.text ?? row.value; });
      setValues(map);
      setLoading(false);
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    for (const key of Object.keys(values)) {
      await supabase.from("site_settings").upsert({ key, value: { text: values[key] } });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading) return <div className="admin-empty">Chargement…</div>;

  return (
    <div>
      <h1>Paramètres du site</h1>
      <form className="admin-form" onSubmit={save}>
        <h2 style={{ margin: 0, fontSize: 15 }}>Page d'accueil</h2>
        <label>Titre du hero<input value={values.hero_title} onChange={(e) => setValues({ ...values, hero_title: e.target.value })} /></label>
        <label>Sous-titre du hero<textarea rows={2} value={values.hero_subtitle} onChange={(e) => setValues({ ...values, hero_subtitle: e.target.value })} /></label>
        <div className="admin-form-row">
          <label>Statistique 1 (cours)<input value={values.stat_courses} onChange={(e) => setValues({ ...values, stat_courses: e.target.value })} /></label>
          <label>Statistique 2 (formations)<input value={values.stat_formations} onChange={(e) => setValues({ ...values, stat_formations: e.target.value })} /></label>
        </div>
        <h2 style={{ margin: "10px 0 0", fontSize: 15 }}>Pied de page & contact</h2>
        <label>Slogan du footer<input value={values.footer_tagline} onChange={(e) => setValues({ ...values, footer_tagline: e.target.value })} /></label>
        <label>Mention de copyright<input value={values.footer_copyright} onChange={(e) => setValues({ ...values, footer_copyright: e.target.value })} /></label>
        <div className="admin-form-row">
          <label>Email de contact<input value={values.contact_email} onChange={(e) => setValues({ ...values, contact_email: e.target.value })} /></label>
          <label>Téléphone de contact<input value={values.contact_phone} onChange={(e) => setValues({ ...values, contact_phone: e.target.value })} /></label>
        </div>
        <button className="btn btn-primary" type="submit">Enregistrer</button>
        {saved && <span style={{ color: "#16a34a", fontSize: 13 }}>✓ Enregistré</span>}
      </form>
    </div>
  );
}
