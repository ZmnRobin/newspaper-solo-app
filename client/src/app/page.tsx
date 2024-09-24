"use client";
import ArticleList from "@/components/articles/ArticleList";
import CustomLoader from "@/components/loader/CustomLoader";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { getAllArticles } from "@/services/newsService";
import { Articles } from "@/types/types";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function Home() {
  const [articles, setArticles] = useState<Articles[]>([]);
  const [page, setPage] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true); 

    // Initialize the Socket.io client
    useEffect(() => {
      const socket = io("http://localhost:5000");
  
      // Listen for the 'articleIndexed' event
      socket.on('articleIndexed', (newArticle) => {
        setArticles((prevArticles) => [newArticle, ...prevArticles]);
      });
  
      return () => {
        socket.disconnect();
      };
    }, []);

  // Fetch more articles when scrolling reaches the end
  const fetchMoreArticles = async () => {
    if (!hasMore) return; // Stop if no more data
    try {
      const data = await getAllArticles(page); // Fetch next page of articles
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
    const fetchArticles = async () => {
      setLoading(true);
        try {
          const data = await getAllArticles(page);
          setArticles(data?.articles);
          setPage((prev) => prev + 1);
          setLoading(false);
        } catch (err) {
          setError("Failed to fetch articles");
        } finally {
          setLoading(false);
        }
    };
    fetchArticles();
  }, []);

  return (
    <>
      {error && <div>{error}</div>}
      <ArticleList articles={articles} loading={loading}/>
      {isFetching && hasMore && <CustomLoader />}
    </>
  );
}
