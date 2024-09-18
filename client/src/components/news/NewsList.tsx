import { Articles } from "@/configs/types";
import React from "react";
import NewsCard from "./NewsCard";

interface NewsListProps {
  articles: Articles[];
}

export default function NewsList({ articles }: NewsListProps) {
  console.log(articles);
  if (articles.length === 0) {
    return <div className="text-2xl m-4">No article found.</div>;
  }
  const [featured,secondFeature,thirdFeature, ...restArticles] = articles;

  return (
    <div className="grid gap-6 grid-cols-6 auto-rows-auto m-5">
      {/* Featured article - spans 4 columns and 2 rows */}
      <div className="col-span-6 md:col-span-4 row-span-2 border-r-2 border-b-2 p-5">
        <NewsCard article={featured} featured={true} />
      </div>

      {/* Second featured article - spans 2 columns and 1 row */}
      <div className="col-span-6 md:col-span-2 row-span-1 border-b-2 p-5">
        <NewsCard article={secondFeature} mediumFeature={true} />
      </div>

      {/* Third featured article - spans 2 columns and 1 row */}
      <div className="col-span-6 md:col-span-2 row-span-1 border-b-2 p-5">
        <NewsCard article={thirdFeature} mediumFeature={true} />
      </div>

      {/* Rest of the articles - each spans 2 columns */}
      {restArticles.map((article,index) => (
        <div key={index} className="col-span-6 md:col-span-2 border p-5">
          <NewsCard article={article} />
        </div>
      ))}
    </div>
  );
}
