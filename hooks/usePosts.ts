"use client";
import { useState, useEffect } from "react";
import {
  getFeedPosts,
  createPostAction,
  toggleLikeAction,
  sharePostAction,
  deletePostAction,
  updatePostAction,
} from "@/services/post.service";
import { toast } from "sonner";

export function usePosts(userId?: string, userName?: string) {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    const data = await getFeedPosts(userId);
    setPosts(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  const addPost = async (content: string) => {
    if (!userId) return;
    try {
      await createPostAction(userId, content);
      fetchPosts();
      toast.success("Pinned to the board!");
    } catch (err) {
      toast.error("Failed to post");
    }
  };

  const likePost = async (postId: string, authorId: string) => {
    if (!userId) return toast.error("Login to like");
    try {
      await toggleLikeAction(postId, userId, authorId, userName || "A reader");
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const sharePost = async (postId: string, authorId: string) => {
    if (!userId) return toast.error("Login to share");
    try {
      await sharePostAction(postId, userId, authorId, userName || "A reader");
      fetchPosts();
      toast.success("Post shared!");
    } catch (err) {
      console.error(err);
    }
  };

  return {
    posts,
    isLoading,
    addPost,
    likePost,
    sharePost,
    deletePost: deletePostAction,
    updatePost: updatePostAction,
    refresh: fetchPosts,
  };
}
