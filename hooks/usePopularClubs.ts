"use client";
import { useState, useEffect } from "react";
import { getPopularClubs } from "@/services/club.service";

export function usePopularClubs() {
  const [popularClubs, setPopularClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPopularClubs().then((data) => {
      setPopularClubs(data);
      setLoading(false);
    });
  }, []);

  return { popularClubs, loading };
}
