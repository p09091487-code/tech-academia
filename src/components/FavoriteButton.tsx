import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function FavoriteButton({ formationId }: { formationId: string }) {
  const { user } = useAuth();
  const [fav, setFav] = useState(false);

  useEffect(() => { (async () => {
    if (!user) return;
    const { data } = await supabase.from("favorites").select("*").eq("user_id", user.id).eq("formation_id", formationId).maybeSingle();
    setFav(!!data);
  })(); }, [user, formationId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    if (!user) return;
    if (fav) { await supabase.from("favorites").delete().eq("user_id", user.id).eq("formation_id", formationId); setFav(false); }
    else { await supabase.from("favorites").insert({ user_id: user.id, formation_id: formationId }); setFav(true); }
  }

  if (!user) return null;
  return (
    <button onClick={toggle} style={{ position: "absolute", top: 10, right: 10, background: "#fff", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.12)" }}>
      <Heart size={16} fill={fav ? "#ef4444" : "none"} color={fav ? "#ef4444" : "#94a3b8"} />
    </button>
  );
}
