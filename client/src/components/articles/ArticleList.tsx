import { Articles } from "@/configs/types";
import React from "react";
import ArticleCard from "./ArticleCard";

interface ArticleListProps {
  articles: Articles[];
}

export default function ArticleList({ articles }: ArticleListProps) {
  if (articles.length === 0) {
    return <div className="text-2xl m-4">No article found.</div>;
  }

  const [secondFeature,thirdFeature,featured, fourthFeature, fifthFeature, ...restArticles] = articles;

  return (
    <div className="m-5 space-y-6">
      {/* Upper Section: Two medium features on the left and right, featured article in the center */}
      <div className="grid gap-6 grid-cols-5">
        {/* Left Medium Feature (smaller size, spans 1 column) */}
        <div className="col-span-6 md:col-span-1">
          <ArticleCard article={secondFeature} mediumFeature={true}/>
        </div>

        {/* Center Featured Article (spans 4 columns and 2 rows) */}
        <div className="col-span-6 md:col-span-3 row-span-2 px-3">
          <ArticleCard article={featured} featured={true} />
        </div>

        {/* Right Medium Feature (smaller size, spans 1 column) */}
        <div className="col-span-6 md:col-span-1">
          <ArticleCard article={thirdFeature} mediumFeature={true} />
        </div>

        {/* Another Left Medium Feature (spans 1 column) */}
        <div className="col-span-6 md:col-span-1">
          <ArticleCard article={fourthFeature} mediumFeature={true} />
        </div>

        {/* Another Right Medium Feature (spans 1 column) */}
        <div className="col-span-6 md:col-span-1">
          <ArticleCard article={fifthFeature} mediumFeature={true} />
        </div>
      </div>

      {/* Rest of the articles in a 4-column grid */}
      <div className="grid gap-6 grid-cols-4 auto-rows-auto">
        {restArticles.map((article, index) => (
          <div key={index} className="col-span-6 md:col-span-3 lg:col-span-1 p-2">
            <ArticleCard article={article} />
          </div>
        ))}
      </div>
    </div>
  );
}
