import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Articles } from "@/configs/types";
import { getImageSrc, convertDateFormat } from "@/utils/sharedFunction";

interface RelatedArticlesProps {
  articles: Articles[];
}

export default function RelatedArticles({ articles }: RelatedArticlesProps) {
  return (
    <div className="lg:col-span-3">
      <div className="bg-white shadow p-4">
        <h2 className="font-bold text-xl mb-4">Related Articles</h2>
        <div className="space-y-4">
          {articles.map((article) => (
            <div key={article.id}>
              <Link href={`/${article.id}`}>
                <div className="relative w-full h-40">
                  <Image
                    src={getImageSrc(article.thumbnail || "")}
                    alt={article.title}
                    fill
                    objectFit="cover"
                  />
                </div>
              </Link>
              <div className="mt-1">
                <Link href={`/${article.id}`}>
                  <h3 className="font-semibold hover:text-sky-500">{article.title}</h3>
                </Link>
                <p className="text-sm text-gray-500">
                  {article.User.name} . <span>{convertDateFormat(article.createdAt.toString())}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
