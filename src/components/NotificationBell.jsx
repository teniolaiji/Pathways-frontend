import { useState, useEffect, useRef } from "react";
import { T } from "./Shared";
import API from "../config";

export default function NotificationBell({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [open,          setOpen]          = useState(false);
  const ref = useRef(null);

  const auth = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res  = await fetch(`${API}/notifications`, { headers: auth });
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch { /* silently fail */ }
  };

  const markRead = async (id) => {
    await fetch(`${API}/notifications/${id}/read`, { method: "PUT", headers: auth });
    setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await fetch(`${API}/notifications/read-all`, { method: "PUT", headers: auth });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotif = async (id, e) => {
    e.stopPropagation();
    await fetch(`${API}/notifications/${id}`, { method: "DELETE", headers: auth });
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const typeIcon = {
    badge:             "🏅",
    resource_restored: "✅",
    resource_removed:  "⚠️",
    pathway_complete:  "🎉",
    welcome:           "👋",
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div ref={ref} style={s.wrapper}>
      {/* Bell button */}
      <button style={s.bell} onClick={() => setOpen(!open)}>
        🔔
        {unreadCount > 0 && (
          <span style={s.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={s.dropdown}>
          <div style={s.header}>
            <span style={s.headerTitle}>Notifications</span>
            {unreadCount > 0 && (
              <button style={s.markAll} onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>

          <div style={s.list}>
            {notifications.length === 0 ? (
              <div style={s.empty}>No notifications yet</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  style={{ ...s.item, backgroundColor: n.isRead ? T.white : "#f5f3ff" }}
                  onClick={() => !n.isRead && markRead(n._id)}
                >
                  <div style={s.itemIcon}>{typeIcon[n.type] || "📌"}</div>
                  <div style={s.itemBody}>
                    <div style={s.itemTitle}>{n.title}</div>
                    <div style={s.itemMessage}>{n.message}</div>
                    <div style={s.itemTime}>{timeAgo(n.createdAt)}</div>
                  </div>
                  <button style={s.deleteBtn} onClick={(e) => deleteNotif(n._id, e)}>×</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  wrapper:  { position: "relative", display: "inline-block" },
  bell: {
    background: "none", border: "none", fontSize: "20px",
    cursor: "pointer", position: "relative", padding: "4px 8px",
  },
  badge: {
    position: "absolute", top: "0", right: "0",
    backgroundColor: T.red500, color: T.white,
    borderRadius: "999px", fontSize: "10px", fontWeight: "700",
    padding: "1px 5px", minWidth: "16px", textAlign: "center",
  },
  dropdown: {
    position: "absolute", right: "0", top: "40px",
    width: "340px", backgroundColor: T.white,
    border: T.cardBorder, borderRadius: T.radius,
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    zIndex: 1000, overflow: "hidden",
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "14px 16px", borderBottom: `1px solid ${T.purple100}`,
  },
  headerTitle: { fontSize: "14px", fontWeight: "700", color: T.purple900 },
  markAll: {
    background: "none", border: "none", color: T.purple500,
    fontSize: "12px", fontWeight: "600", cursor: "pointer",
    fontFamily: T.font,
  },
  list:  { maxHeight: "380px", overflowY: "auto" },
  empty: { padding: "32px", textAlign: "center", color: T.gray500, fontSize: "13px" },
  item: {
    display: "flex", gap: "10px", padding: "12px 16px",
    borderBottom: `1px solid ${T.gray100}`, cursor: "pointer",
    alignItems: "flex-start",
  },
  itemIcon:    { fontSize: "18px", flexShrink: 0, marginTop: "2px" },
  itemBody:    { flex: 1, minWidth: 0 },
  itemTitle:   { fontSize: "13px", fontWeight: "600", color: T.purple900, marginBottom: "2px" },
  itemMessage: { fontSize: "12px", color: T.gray500, lineHeight: "1.4", marginBottom: "4px" },
  itemTime:    { fontSize: "11px", color: T.purple400 },
  deleteBtn: {
    background: "none", border: "none", color: T.gray300,
    fontSize: "16px", cursor: "pointer", flexShrink: 0, padding: "0 2px",
    fontFamily: T.font, lineHeight: 1,
  },
};