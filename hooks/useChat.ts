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
import { getClubName } from "@/services/club.service";
import { toast } from "sonner";

export function useChat(clubId: string, userId?: string) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [unreadRooms, setUnreadRooms] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [clubName, setClubName] = useState<string>("");
  const [viewMode, setViewMode] = useState<"chat" | "pdf">("chat");

  // State to track if we are currently loading a specific room
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);

  // 1. Initial Data Load
  const refreshData = useCallback(async () => {
    if (!userId || !clubId) return;

    try {
      const [roomData, progress, pdfLink, name] = await Promise.all([
        getClubRooms(clubId, userId),
        getUserClubProgress(userId, clubId),
        getClubPdfUrl(clubId),
        getClubName(clubId),
      ]);

      setRooms(roomData);
      setCurrentPage(progress);
      setPdfUrl(pdfLink);
      setClubName(name);

      if (!activeRoom && roomData.length > 0) {
        const defaultRoom =
          roomData.find((r: any) => r.type === "GENERAL") || roomData[0];
        setActiveRoom(defaultRoom);
      }
    } catch (err) {
      console.error("Initialization Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [clubId, userId, activeRoom]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // 2. Polling Logic for Messages
  useEffect(() => {
    if (!activeRoom || !userId || !clubId || isFetchingMessages) return;

    const poll = async () => {
      try {
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
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    poll();
    const interval = setInterval(poll, 4000); // Polling every 4 seconds
    return () => clearInterval(interval);
  }, [activeRoom, clubId, userId, isFetchingMessages]);

  // 3. Update Progress (Fixing NaN issue)
  const logProgress = async (pageValue: any) => {
    const page = parseInt(pageValue);
    if (!userId || isNaN(page)) {
      return toast.error("Invalid page number provided.");
    }

    try {
      const res = await updateUserProgress(userId, clubId, page);
      if (res.success) {
        setCurrentPage(page);
        toast.success(`Progress synced to page ${page}`);
        const roomData = await getClubRooms(clubId, userId);
        setRooms(roomData);
      }
    } catch (err: any) {
      toast.error(err.message || "Sync failed");
    }
  };

  // 4. Message Actions
  const removeMessage = async (msgId: string) => {
    try {
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      await deleteRoomMessage(userId!, msgId);
    } catch (err) {
      toast.error("Could not delete message");
    }
  };

  const updateMessage = async (msgId: string, content: string) => {
    if (!content.trim()) return;
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
    if (!userId || !activeRoom || !content.trim()) return;
    try {
      await sendRoomMessage(userId, activeRoom.id, content);
      // Immediately fetch to show the message
      const msgData = await getRoomMessages(activeRoom.id);
      setMessages(msgData);
    } catch (err) {
      toast.error("Message failed to send");
    }
  };

  // 5. Explicit Room Changer with Loading State
  const handleSetRoom = async (room: any) => {
    if (room.id === activeRoom?.id || isFetchingMessages) return;

    setIsFetchingMessages(true);
    setActiveRoom(room);
    try {
      const msgData = await getRoomMessages(room.id);
      setMessages(msgData);
    } finally {
      setIsFetchingMessages(false);
    }
  };

  return {
    rooms,
    activeRoom,
    setActiveRoom: handleSetRoom,
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
    clubName,
    isFetchingMessages,
  };
}
