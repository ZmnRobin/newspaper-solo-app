"use client";
import NewsList from "@/components/news/NewsList";
import { getAllNews } from "@/services/newsService";
import { useEffect, useState } from "react";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getAllNews();
        setArticles(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch news");
        setLoading(false);
      }
    };

    fetchNews();
  }, []);
  
  return (
    <>
      {loading && <div>Loading...</div>}
      {error && <div>{error}</div>}
      <NewsList articles={articles} />
    </>
  );
}
