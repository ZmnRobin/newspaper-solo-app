"use client";
import ArticleList from '@/components/articles/ArticleList';
import { getArticlesByGenre } from '@/services/newsService';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react'

export default function GenreBasedArticlePage() { 
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { genreId } = useParams();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getArticlesByGenre(genreId);
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
      <ArticleList articles={articles} />
    </>
  );
}
