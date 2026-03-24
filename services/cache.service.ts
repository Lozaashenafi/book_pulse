// services/cache.service.ts
import { db } from "@/lib/db";
import { readingProgress, chatMessages, chatRooms } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheService {
  private static instance: CacheService;
  private pdfCache: Map<string, CacheEntry<any>>;
  private chatMessagesCache: Map<string, CacheEntry<any[]>>;
  private roomsCache: Map<string, CacheEntry<any[]>>;
  private progressCache: Map<string, CacheEntry<number>>;
  
  private readonly PDF_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly CHAT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly ROOMS_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private readonly PROGRESS_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

  private constructor() {
    this.pdfCache = new Map();
    this.chatMessagesCache = new Map();
    this.roomsCache = new Map();
    this.progressCache = new Map();
    
    // Cleanup every 10 minutes
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), 10 * 60 * 1000);
    }
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // PDF Caching
  setPDF(url: string, data: any) {
    this.pdfCache.set(url, {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + this.PDF_CACHE_DURATION
    });
  }

  getPDF(url: string): any | null {
    const cached = this.pdfCache.get(url);
    if (cached && Date.now() < cached.expiry) {
      console.log('[Cache] PDF hit:', url);
      return cached.data;
    }
    if (cached) this.pdfCache.delete(url);
    return null;
  }

  // Rooms Caching
  setRooms(clubId: string, rooms: any[]) {
    const key = `rooms_${clubId}`;
    this.roomsCache.set(key, {
      data: rooms,
      timestamp: Date.now(),
      expiry: Date.now() + this.ROOMS_CACHE_DURATION
    });
  }

  getRooms(clubId: string): any[] | null {
    const key = `rooms_${clubId}`;
    const cached = this.roomsCache.get(key);
    if (cached && Date.now() < cached.expiry) {
      console.log('[Cache] Rooms hit:', clubId);
      return cached.data;
    }
    if (cached) this.roomsCache.delete(key);
    return null;
  }

  // Chat Messages Caching
  setMessages(roomId: string, messages: any[]) {
    const key = `messages_${roomId}`;
    this.chatMessagesCache.set(key, {
      data: messages,
      timestamp: Date.now(),
      expiry: Date.now() + this.CHAT_CACHE_DURATION
    });
  }

  getMessages(roomId: string): any[] | null {
    const key = `messages_${roomId}`;
    const cached = this.chatMessagesCache.get(key);
    if (cached && Date.now() < cached.expiry) {
      console.log('[Cache] Messages hit:', roomId);
      return cached.data;
    }
    if (cached) this.chatMessagesCache.delete(key);
    return null;
  }

  // User Progress Caching
  setProgress(userId: string, clubId: string, page: number) {
    const key = `progress_${userId}_${clubId}`;
    this.progressCache.set(key, {
      data: page,
      timestamp: Date.now(),
      expiry: Date.now() + this.PROGRESS_CACHE_DURATION
    });
  }

  getProgress(userId: string, clubId: string): number | null {
    const key = `progress_${userId}_${clubId}`;
    const cached = this.progressCache.get(key);
    if (cached && Date.now() < cached.expiry) {
      console.log('[Cache] Progress hit:', userId, clubId);
      return cached.data;
    }
    if (cached) this.progressCache.delete(key);
    return null;
  }

  // Clear specific cache
  clearRooms(clubId: string) {
    const key = `rooms_${clubId}`;
    this.roomsCache.delete(key);
  }

  clearMessages(roomId: string) {
    const key = `messages_${roomId}`;
    this.chatMessagesCache.delete(key);
  }

  clearProgress(userId: string, clubId: string) {
    const key = `progress_${userId}_${clubId}`;
    this.progressCache.delete(key);
  }

  clearPDF(url: string) {
    this.pdfCache.delete(url);
  }

  // Clear all
  clearAll() {
    this.pdfCache.clear();
    this.chatMessagesCache.clear();
    this.roomsCache.clear();
    this.progressCache.clear();
  }

  // Cleanup expired entries
  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.pdfCache) {
      if (now >= value.expiry) this.pdfCache.delete(key);
    }
    for (const [key, value] of this.chatMessagesCache) {
      if (now >= value.expiry) this.chatMessagesCache.delete(key);
    }
    for (const [key, value] of this.roomsCache) {
      if (now >= value.expiry) this.roomsCache.delete(key);
    }
    for (const [key, value] of this.progressCache) {
      if (now >= value.expiry) this.progressCache.delete(key);
    }
  }
}

export const cacheService = CacheService.getInstance();