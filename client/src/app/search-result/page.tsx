"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { searchArticles } from "@/services/newsService";
import { Articles } from "@/types/types";
import SearchResultSkeleton from "@/components/skeleton/SearchResultSkeleton";
import SearchCard from "@/components/search/SearchCard";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export default function SearchResult() {
  const [results, setResults] = useState<Articles[]>([]);
  const [page, setPage] = useState(1); 
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [hasMore, setHasMore] = useState(true); 

  // Fetch more searchd articles when scrolling reaches the end
  const fetchMoreArticles = async () => {
    if (!hasMore) return; // Stop if no more data
    try {
      const data = await searchArticles(query,page); // Fetch next page of articles
      if (data?.articles?.length > 0) {
        setResults((prev) => [...prev, ...data?.articles]);
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false); // No more articles to fetch
      }
    } catch (err) {
      console.error("Failed to fetch more articles");
    } finally {
      setLoading(false);
    }
  };

  // Use custom infinite scroll hook to trigger fetching more articles
  const [isFetching] = useInfiniteScroll(fetchMoreArticles);

  useEffect(() => {
    if (query) {
      setLoading(true);
      setTimeout(async () => {
        try {
          const data = await searchArticles(query,page);
          setResults(data?.articles);
          setPage((prev) => prev + 1);
          setLoading(false);
        } catch (err) {
          console.error("Failed to fetch articles");
        } finally {
          setLoading(false);
        }
    }, 500);
    }
  }, [query]);

  if (loading) {
    return (
      <div className="container mx-auto w-9/12 p-5">
        <SearchResultSkeleton />
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="container mx-auto w-9/12 p-5">
        <h1 className="text-3xl font-semibold mb-4">
          No results found for "{query}".
        </h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto w-9/12 p-5">
      <h1 className="text-3xl font-semibold mb-4">
        Search Results for "{query}"
      </h1>
      {results.map((article) => (
        <SearchCard key={article.id} article={article} />
      ))}
      {isFetching && hasMore && (
        <h2 className="text-red-400 text-center m-4">Loading more articles...</h2>
      )}
    </div>
  );
}