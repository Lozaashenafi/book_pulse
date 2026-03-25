// hooks/useChat.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getClubRooms,
  getRoomMessages,
  sendRoomMessage,
  updateUserProgress,  // This IS exported from chat.service.ts
  getRoomLastMessages,
  getUserClubProgress,
  deleteRoomMessage,
  editRoomMessage,
  getClubPdfUrl,
} from "@/services/chat.service";
import { getClubName } from "@/services/club.service";
import { toast } from "sonner";
import { cacheService } from "@/services/cache.service";

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
  const [isFetchingMessages, setIsFetchingMessages] = useState(false);
  
  // Refs with proper initialization
  const lastMessagesFetchRef = useRef<Map<string, number>>(new Map());
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  // 1. Initial Data Load with Caching
  const refreshData = useCallback(async () => {
    if (!userId || !clubId) return;

    try {
      // Check cache for rooms and progress first
      const cachedRooms = cacheService.getRooms(clubId);
      const cachedProgress = cacheService.getProgress(userId, clubId);

      // Use cached data immediately if available
      if (cachedRooms && isMountedRef.current) {
        setRooms(cachedRooms);
        if (!activeRoom && cachedRooms.length > 0) {
          const defaultRoom = cachedRooms.find((r: any) => r.type === "GENERAL") || cachedRooms[0];
          setActiveRoom(defaultRoom);
        }
      }
      
      if (cachedProgress !== null && isMountedRef.current) {
        setCurrentPage(cachedProgress);
      }

      // Fetch fresh data in background
      const [roomData, progress, pdfLink, name] = await Promise.all([
        getClubRooms(clubId, userId),
        getUserClubProgress(userId, clubId),
        getClubPdfUrl(clubId),
        getClubName(clubId),
      ]);

      if (!isMountedRef.current) return;

      // Update state if data changed
      if (JSON.stringify(roomData) !== JSON.stringify(cachedRooms)) {
        setRooms(roomData);
        cacheService.setRooms(clubId, roomData);
      }
      
      if (progress !== cachedProgress) {
        setCurrentPage(progress);
        cacheService.setProgress(userId, clubId, progress);
      }
      
      setPdfUrl(pdfLink);
      setClubName(name);

      if (!activeRoom && roomData.length > 0 && !cachedRooms) {
        const defaultRoom = roomData.find((r: any) => r.type === "GENERAL") || roomData[0];
        setActiveRoom(defaultRoom);
      }
    } catch (err) {
      console.error("Initialization Error:", err);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [clubId, userId, activeRoom]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // 2. Load Messages for Active Room with Caching
  const loadMessages = useCallback(async (roomId: string, forceRefresh = false) => {
    if (!roomId) return;
    
    // Check if we fetched recently (within 2 seconds) to avoid rapid requests
    const lastFetch = lastMessagesFetchRef.current.get(roomId);
    const now = Date.now();
    if (!forceRefresh && lastFetch && now - lastFetch < 2000) {
      return;
    }
    
    setIsFetchingMessages(true);
    lastMessagesFetchRef.current.set(roomId, now);
    
    try {
      // Check cache first
      const cachedMessages = cacheService.getMessages(roomId);
      if (cachedMessages && !forceRefresh && isMountedRef.current) {
        setMessages(cachedMessages);
      }
      
      // Always fetch fresh in background for real-time updates
      const msgData = await getRoomMessages(roomId);
      
      if (!isMountedRef.current) return;
      
      // Update if different from cache
      if (JSON.stringify(msgData) !== JSON.stringify(cachedMessages)) {
        setMessages(msgData);
        cacheService.setMessages(roomId, msgData);
      }
      
      // Update last read timestamp
      localStorage.setItem(`lastRead_${roomId}`, new Date().toISOString());
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      if (isMountedRef.current) {
        setIsFetchingMessages(false);
      }
    }
  }, []);

  // 3. Optimized Polling Logic with Caching
  useEffect(() => {
    if (!activeRoom || !userId || !clubId) return;

    // Initial load
    loadMessages(activeRoom.id);

    // Set up polling
    const poll = async () => {
      if (!activeRoom?.id || !isMountedRef.current) return;
      
      try {
        // Fetch fresh messages
        const msgData = await getRoomMessages(activeRoom.id);
        
        if (!isMountedRef.current) return;
        
        // Update cache and state
        cacheService.setMessages(activeRoom.id, msgData);
        setMessages(msgData);

        // Update unread rooms
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

        if (isMountedRef.current) {
          setUnreadRooms(unreads.filter((id: string) => id !== activeRoom.id));
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    pollingIntervalRef.current = setInterval(poll, 4000);
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [activeRoom?.id, clubId, userId, loadMessages]);

  // 4. Update Progress with Caching (Silent sync - no toast)
  const logProgress = useCallback(async (pageValue: any) => {
    const page = parseInt(pageValue);
    if (!userId || isNaN(page) || page === currentPage) return;

    try {
      // Direct call to service (which now handles retries internally)
      const res = await updateUserProgress(userId, clubId, page);
      
      if (res.success && isMountedRef.current) {
        setCurrentPage(page);
        // Only refresh rooms to check for unlocks, don't re-fetch PDF/Name
        const updatedRooms = await getClubRooms(clubId, userId);
        setRooms(updatedRooms);
      }
    } catch (err) {
      console.error("Progress Sync Failed");
    }
  }, [userId, clubId, currentPage]);

  // 5. Message Actions with Cache Invalidation
  const removeMessage = useCallback(async (msgId: string) => {
    if (!userId || !activeRoom?.id) return;
    
    const previousMessages = [...messages];
    
    try {
      // Optimistic update
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      await deleteRoomMessage(userId, msgId);
      // Invalidate cache for this room
      cacheService.clearMessages(activeRoom.id);
    } catch (err) {
      // Revert on error
      setMessages(previousMessages);
      toast.error("Could not delete message");
    }
  }, [userId, activeRoom?.id, messages]);

  const updateMessage = useCallback(async (msgId: string, content: string) => {
    if (!userId || !activeRoom?.id || !content.trim()) return;
    
    const previousMessages = [...messages];
    
    try {
      // Optimistic update
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, content } : m)),
      );
      await editRoomMessage(userId, msgId, content);
      // Invalidate cache for this room
      cacheService.clearMessages(activeRoom.id);
    } catch (err) {
      // Revert on error
      setMessages(previousMessages);
      toast.error("Update failed");
    }
  }, [userId, activeRoom?.id, messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!userId || !activeRoom?.id || !content.trim()) return;
    
    try {
      await sendRoomMessage(userId, activeRoom.id, content);
      // Clear cache to force refresh
      cacheService.clearMessages(activeRoom.id);
      // Load fresh messages
      await loadMessages(activeRoom.id, true);
    } catch (err) {
      toast.error("Message failed to send");
    }
  }, [userId, activeRoom?.id, loadMessages]);

  // 6. Explicit Room Changer with Caching
  const handleSetRoom = useCallback(async (room: any) => {
    if (room.id === activeRoom?.id || isFetchingMessages) return;

    setActiveRoom(room);
    // Load messages immediately (they'll come from cache if available)
    await loadMessages(room.id);
  }, [activeRoom?.id, isFetchingMessages, loadMessages]);

  // 7. Prefetch messages for nearby rooms
  useEffect(() => {
    if (!rooms.length || !activeRoom?.id) return;
    
    // Find current room index
    const currentIndex = rooms.findIndex(r => r.id === activeRoom.id);
    if (currentIndex === -1) return;
    
    // Prefetch next and previous rooms
    const roomsToPrefetch = [
      rooms[currentIndex - 1],
      rooms[currentIndex + 1]
    ].filter(Boolean);
    
    roomsToPrefetch.forEach(room => {
      if (room && !cacheService.getMessages(room.id)) {
        // Prefetch in background without blocking UI
        setTimeout(() => {
          getRoomMessages(room.id).then(messages => {
            cacheService.setMessages(room.id, messages);
          }).catch(console.error);
        }, 1000);
      }
    });
  }, [rooms, activeRoom?.id]);

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