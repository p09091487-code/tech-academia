import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

export default function NotificationsBell() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    if (!user) return;
    const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(15);
    setItems(data ?? []);
  }
  useEffect(() => { load(); }, [user]);

  useEffect(() => {
    function onClick(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function toggleOpen() {
    const next = !open;
    setOpen(next);
    if (next && unread > 0) {
      const ids = items.filter((i) => !i.read).map((i) => i.id);
      if (ids.length) { await supabase.from("notifications").update({ read: true }).in("id", ids); load(); }
    }
  }

  if (!user) return null;
  const unread = items.filter((i) => !i.read).length;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="btn btn-ghost" onClick={toggleOpen} style={{ position: "relative", padding: "10px 12px" }}>
        <Bell size={18} />
        {unread > 0 && <span style={{ position: "absolute", top: 2, right: 2, background: "#ef4444", color: "#fff", fontSize: 10, borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{unread}</span>}
      </button>
      {open && (
        <div style={{ position: "absolute", right: 0, top: "110%", width: 300, maxHeight: 360, overflowY: "auto", background: "#0f1422", border: "1px solid #ffffff18", borderRadius: 12, boxShadow: "0 20px 50px #0009", zIndex: 30 }}>
          {items.length === 0 ? (
            <div style={{ padding: 16, fontSize: 13, color: "#7f8aa5" }}>Aucune notification.</div>
          ) : items.map((n) => (
            <div key={n.id} style={{ padding: "10px 14px", borderBottom: "1px solid #ffffff10", fontSize: 13 }}>
              <b style={{ display: "block" }}>{n.title}</b>
              <span style={{ color: "#aab2c8" }}>{n.body}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
