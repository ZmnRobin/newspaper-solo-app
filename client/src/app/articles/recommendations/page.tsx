"use client";
import ArticleList from "@/components/articles/ArticleList";
import { getRecommensdedArticles } from "@/services/newsService";
import { Articles } from "@/types/types";
import React, { useEffect, useState } from "react";

function RecommendationsPage() {
  const [articles, setArticles] = useState<Articles[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

    // Fetch initial news on component mount
    useEffect(() => {
        const fetchArticles = async () => {
          setLoading(true);
            try {
              const data = await getRecommensdedArticles("",10);
              setArticles(data);
              setLoading(false);
            } catch (err) {
              setError("Failed to fetch articles");
            } finally {
              setLoading(false);
            }
        };
        fetchArticles();
      }, []);


  return(
    <>
     {error && <div>{error}</div>}
     <ArticleList articles={articles} loading={loading}/>
    </>
  );
}

export default RecommendationsPage;
