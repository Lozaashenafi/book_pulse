"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getClubRooms,
  getRoomMessages,
  sendRoomMessage,
  updateUserProgress,
  getRoomLastMessages,
  getUserClubProgress,
  deleteRoomMessage,
  editRoomMessage,
  getClubPdfUrl,
} from "@/services/chat.service";
import { toast } from "sonner";
import { url } from "inspector/promises";

export function useChat(clubId: string, userId?: string) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadRooms, setUnreadRooms] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"chat" | "pdf">("chat");

  // Load Rooms & Initial Progress
  const refreshData = useCallback(async () => {
    if (!userId) return;
    const [roomData, progress, url] = await Promise.all([
      getClubRooms(clubId, userId),
      getUserClubProgress(userId, clubId),
      getClubPdfUrl(clubId),
    ]);
    setRooms(roomData);
    setCurrentPage(progress);
    setPdfUrl(url);

    if (!activeRoom && roomData.length > 0)
      setActiveRoom(roomData.find((r) => r.type === "GENERAL") || roomData[0]);
  }, [clubId, userId, activeRoom]);

  useEffect(() => {
    refreshData().then(() => setIsLoading(false));
  }, [refreshData]);

  // Polling logic for real-time feel
  useEffect(() => {
    if (!activeRoom || !userId) return;
    const poll = async () => {
      const msgData = await getRoomMessages(activeRoom.id);
      setMessages(msgData);
      localStorage.setItem(
        `lastRead_${activeRoom.id}`,
        new Date().toISOString(),
      );
      const lastMessages = await getRoomLastMessages(clubId);
      const unreads = lastMessages
        .filter((m: any) => {
          const lastSeen = localStorage.getItem(`lastRead_${m.roomId}`);
          return (
            m.lastTimestamp &&
            (!lastSeen || new Date(m.lastTimestamp) > new Date(lastSeen))
          );
        })
        .map((m: any) => m.roomId);
      setUnreadRooms(unreads.filter((id: string) => id !== activeRoom.id));
    };
    poll();
    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [activeRoom, clubId, userId]);

  const logProgress = async (page: number) => {
    if (!userId) return;
    try {
      await updateUserProgress(userId, clubId, page);
      setCurrentPage(page);
      toast.success(`Progress synced to page ${page}`);
      refreshData();
    } catch (err) {
      toast.error("Sync failed");
    }
  };

  const removeMessage = async (msgId: string) => {
    try {
      setMessages((prev) => prev.filter((m) => m.id !== msgId)); // Optimistic
      await deleteRoomMessage(userId!, msgId);
    } catch (err) {
      toast.error("Could not delete");
    }
  };

  const updateMessage = async (msgId: string, content: string) => {
    try {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, content } : m)),
      );
      await editRoomMessage(userId!, msgId, content);
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const sendMessage = async (content: string) => {
    if (!userId || !activeRoom) return;
    await sendRoomMessage(userId, activeRoom.id, content);
  };

  return {
    rooms,
    activeRoom,
    setActiveRoom,
    messages,
    sendMessage,
    logProgress,
    currentPage,
    unreadRooms,
    isLoading,
    removeMessage,
    updateMessage,
    pdfUrl,
    viewMode,
    setViewMode,
  };
}
