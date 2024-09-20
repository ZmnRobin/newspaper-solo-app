"use client";
import { searchArticles } from "@/services/newsService";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Articles } from "@/configs/types";
import { convertDateFormat, getImageSrc } from "@/utils/sharedFunction";

export default function SearchResult() {
  const [results, setResults] = useState<Articles[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  useEffect(() => {
    if (query) {
      setLoading(true);
      // Call your API to search for articles based on the query
      searchArticles(query)
        .then((data) => {
          setResults(data);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching search results:", error);
          setLoading(false);
        });
    }
  }, [query]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!results.length) {
    return (
      <div className="text-3xl font-semibold mb-4 mt-3">
        No results found for "{query}".
      </div>
    );
  }

  return (
    <div className="container mx-auto w-9/12 p-5">
      <h1 className="text-3xl font-semibold mb-4">
        Search Results for "{query}"
      </h1>
      {results.map((article: any, index: number) => (
        <div className="flex items-start shadow-md p-4 mt-3">
          {/* Thumbnail */}
          <div className="w-1/4">
            <Link href={`/${article.id}`}>
              <img
                src={getImageSrc(article?.thumbnail)}
                alt={article.title}
                className="w-full h-40"
              />
            </Link>
          </div>

          {/* Article Info */}
          <div className="w-3/4 pl-4">
            {/* Title */}
            <h2 className="text-xl font-bold mb-2">
              <Link
                href={`/${article.id}`}
                className="hover:text-sky-500"
              >
                {article.title}
              </Link>
            </h2>

            {/* Content */}
            <p className="text-gray-700 line-clamp-3">{article.content}</p>

            {/* Author and Date */}
            <div className="text-sm text-gray-500 mt-2">
              <span>By {article.User.name}</span> |{" "}
              <span>{convertDateFormat(article?.published_at)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
