"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getUserNotes,
  createNoteAction,
  deleteNoteAction,
  updateNoteAction,
  togglePinAction,
} from "@/services/note.service";
import { toast } from "sonner";

export function useNotes(userId?: string) {
  const [rawNotes, setRawNotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const fetchNotes = async () => {
    if (!userId) return;
    const data = await getUserNotes(userId);
    setRawNotes(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, [userId]);

  // Handle Search and Tag filtering locally for speed
  const filteredNotes = useMemo(() => {
    return rawNotes.filter((note) => {
      const matchesSearch =
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag =
        !selectedTag || (note.tags && note.tags.includes(selectedTag));
      return matchesSearch && matchesTag;
    });
  }, [rawNotes, searchQuery, selectedTag]);

  const addNote = async (title: string, content: string, tags: string[]) => {
    if (!userId) return;
    try {
      await createNoteAction(userId, { title, content, tags });
      fetchNotes();
      toast.success("Scribble filed away.");
    } catch (err) {
      toast.error("Failed to save note");
    }
  };

  const removeNote = async (id: string) => {
    setRawNotes((prev) => prev.filter((n) => n.id !== id));
    await deleteNoteAction(userId!, id);
  };

  const updateNote = async (id: string, updates: any) => {
    await updateNoteAction(userId!, id, updates);
    fetchNotes();
  };

  const togglePin = async (id: string, currentStatus: boolean) => {
    setRawNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !currentStatus } : n)),
    );
    await togglePinAction(userId!, id, !currentStatus);
  };

  return {
    notes: filteredNotes,
    allTags: Array.from(new Set(rawNotes.flatMap((n) => n.tags || []))),
    isLoading,
    addNote,
    removeNote,
    updateNote,
    togglePin,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
  };
}
