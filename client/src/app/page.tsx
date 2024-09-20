"use client";
import ArticleList from "@/components/articles/ArticleList";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { getAllNews } from "@/services/newsService";
import { useEffect, useState } from "react";

export default function Home() {
  const [articles, setArticles] = useState<any[]>([]);
  const [page, setPage] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true); 

  // Fetch more articles when scrolling reaches the end
  const fetchMoreArticles = async () => {
    if (!hasMore) return; // Stop if no more data

    setLoading(true);
    try {
      const data = await getAllNews(page); // Fetch next page of articles
      if (data?.articles?.length > 0) {
        setArticles((prev) => [...prev, ...data?.articles]);
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false); // No more articles to fetch
      }
    } catch (err) {
      setError("Failed to fetch more articles");
    } finally {
      setLoading(false);
    }
  };

  // Use custom infinite scroll hook to trigger fetching more articles
  const [isFetching] = useInfiniteScroll(fetchMoreArticles);

  // Fetch initial news on component mount
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const data = await getAllNews(1); 
        setArticles(data?.articles || []);
        setPage(2); 
      } catch (err) {
        setError("Failed to fetch news");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <>
      {loading && <div>Loading...</div>}
      {error && <div>{error}</div>}
      <ArticleList articles={articles} />
      {isFetching && hasMore && <div>Loading more articles...</div>}
    </>
  );
}
