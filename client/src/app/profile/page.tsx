"use client";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { getArticlesByAuthor, deleteArticleById } from "@/services/newsService";
import MyArticle from "@/components/profile/MyArticle";
import { Article } from "@/configs/types";

export default function UserProfilePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = Cookies.get("user");
    if (userData) {
      const user = JSON.parse(userData);
      const { id } = user;
      getArticlesByAuthor(id).then((data) => {
        setArticles(data);
        setLoading(false);
      });
    }
  }, []);

  const handleDelete = (articleId: number) => {
    deleteArticleById(articleId).then(() => {
      setArticles((prevArticles) => prevArticles.filter(article => article?.id !== articleId));
    });
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Articles</h1>
      <MyArticle articles={articles} onDelete={handleDelete} />
    </div>
  );
}
