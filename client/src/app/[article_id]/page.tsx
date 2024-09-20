"use client";
import SingleArticle from "@/components/singleArticle/SingleArticle";
import { getNewsById } from "@/services/newsService";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function ArticleDetailsPage() {
  const params = useParams();
  const { article_id } = params;
  const [article, setArticle] = useState(null);
  const [loading,setLoading]= useState(false);
  const [error,setError]=useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await getNewsById(article_id);
        setArticle(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch news');
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
  <>
    {loading && <div>Loading...</div>}
    {error && <div>{error}</div>}
    {article && <SingleArticle article={article} />}
  </>
);
}
