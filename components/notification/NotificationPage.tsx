"use client";

import React, { useState } from "react";
import {
  Bell,
  Mail,
  Users,
  PenTool,
  Bookmark,
  Megaphone,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  Inbox,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

// Mock Data based on your notificationTypeEnum
const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "CLUB_INVITE",
    title: "New Invitation",
    message:
      "Elena Wright has invited you to join the 'Midnight Classics' circle.",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "2",
    type: "NEW_POST",
    title: "Daily Scribble",
    message:
      "A new discussion has started in 'Sci-Fi Frontiers' regarding Chapter 4.",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
  {
    id: "3",
    type: "READING_REMINDER",
    title: "Keep the Pulse",
    message:
      "You're 15 pages behind the current pace in 'The Great Gatsby' club.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
  },
  {
    id: "4",
    type: "NEW_MEMBER",
    title: "Circle Growth",
    message: "Alex Reader just joined your 'Poetry Nook' fellowship.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
  },
];

const NotificationPage = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const { profile } = useAuthStore();

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case "NEW_MEMBER":
        return {
          icon: <Users size={18} />,
          color: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "NEW_POST":
        return {
          icon: <PenTool size={18} />,
          color: "bg-tertiary/5 text-tertiary border-tertiary/20",
        };
      case "READING_REMINDER":
        return {
          icon: <Bookmark size={18} />,
          color: "bg-amber-50 text-amber-700 border-amber-200",
        };
      case "CLUB_INVITE":
        return {
          icon: <Mail size={18} />,
          color: "bg-[#d4a373]/10 text-[#8b5a2b] border-[#d4a373]/30",
        };
      case "ANNOUNCEMENT":
        return {
          icon: <Megaphone size={18} />,
          color: "bg-purple-50 text-purple-700 border-purple-200",
        };
      default:
        return {
          icon: <Bell size={18} />,
          color: "bg-gray-50 text-gray-700 border-gray-200",
        };
    }
  };

  return (
    <div className="pb-20 transition-colors duration-500 min-h-screen">
      <div className="max-w-4xl mx-auto px-6">
        {/* HEADER: The Ledger Header */}
        <header className="mb-12 border-b-2 border-tertiary/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-block bg-tertiary text-[#f4ebd0] px-3 py-0.5 text-[10px] font-mono font-black uppercase tracking-[0.3em] mb-4">
              Postmaster Ledger
            </div>
            <h1 className="text-5xl font-serif font-black text-tertiary dark:text-[#d4a373] tracking-tighter leading-none">
              Daily <span className="italic">Correspondence</span>
            </h1>
            <p className="text-[#8b5a2b] dark:text-gray-400 mt-2 font-serif italic text-lg">
              Fresh updates from your literary squads.
            </p>
          </div>

          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-widest text-tertiary hover:underline"
          >
            <CheckCircle2 size={14} /> Clear Unread
          </button>
        </header>

        {/* NOTIFICATION LIST */}
        <div className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((n) => {
              const styles = getNotificationStyles(n.type);
              return (
                <div
                  key={n.id}
                  className={`group relative flex gap-6 p-6 border-2 transition-all ${
                    n.isRead
                      ? "bg-white/40 dark:bg-transparent border-[#d6c7a1]/30 opacity-70"
                      : "bg-white dark:bg-[#252525] border-tertiary shadow-[6px_6px_0px_rgba(26,63,34,0.1)]"
                  }`}
                >
                  {/* Status Indicator (Wax Seal style) */}
                  {!n.isRead && (
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-tertiary rounded-full border-2 border-[#fdfcf8] shadow-md z-10" />
                  )}

                  {/* Icon Column */}
                  <div
                    className={`shrink-0 w-12 h-12 flex items-center justify-center border ${styles.color}`}
                  >
                    {styles.icon}
                  </div>

                  {/* Content Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-black uppercase tracking-tighter text-[#8b5a2b]">
                        {n.type.replace("_", " ")}
                      </span>
                      <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                        <Clock size={10} />{" "}
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <h3
                      className={`text-lg font-serif font-black ${n.isRead ? "text-gray-500" : "text-tertiary dark:text-[#d4a373]"}`}
                    >
                      {n.title}
                    </h3>
                    <p className="text-sm font-serif italic text-[#5c4033] dark:text-gray-400 leading-relaxed mt-1">
                      {n.message}
                    </p>

                    {/* Meta Action (e.g., View Club) */}
                    <button className="mt-4 flex items-center gap-2 text-[10px] font-mono font-black uppercase text-tertiary opacity-0 group-hover:opacity-100 transition-opacity">
                      Inspect Details <ArrowRight size={12} />
                    </button>
                  </div>

                  {/* Delete Action */}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="shrink-0 self-start p-2 text-gray-300 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })
          ) : (
            /* EMPTY STATE: "The Empty Mailbox" */
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white/50 dark:bg-[#252525] border-2 border-dashed border-[#d6c7a1] dark:border-[#3e2b22]">
              <Inbox size={60} className="text-tertiary opacity-10 mb-6" />
              <h3 className="text-2xl font-serif font-black text-tertiary dark:text-white opacity-40">
                Silence in the Archives
              </h3>
              <p className="text-[#8b5a2b] dark:text-gray-400 font-serif italic mt-2 opacity-60">
                Your mailbox is currently vacant. New correspondence will appear
                here.
              </p>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <footer className="mt-16 text-center border-t border-[#d6c7a1] pt-8 opacity-40">
          <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-[#8b5a2b]">
            Official BookPulse Notification System • v2.0
          </p>
        </footer>
      </div>
    </div>
  );
};

export default NotificationPage;
