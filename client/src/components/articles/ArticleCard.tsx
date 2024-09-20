import React from "react";
import Link from "next/link";
import { Articles } from "@/configs/types";
import Image from "next/image";
import { convertDateFormat, getImageSrc } from "@/utils/sharedFunction";

interface ArticleCardProps {
  article: Articles;
  featured?: boolean;
  mediumFeature?: boolean;
}

export default function ArticleCard({
  article,
  featured = false,
  mediumFeature = false,
}: ArticleCardProps) {
  return (
    <div className={`bg-white overflow-hidden ${featured ? "h-full" : ""}`}>
      <Link href={`/${article?.id}`}>
        <div
          className={`relative ${
            featured ? "h-96" : mediumFeature ? "h-48" : "h-48"
          }`}
        >
          {article?.thumbnail ? (
            <Image
              src={getImageSrc(article?.thumbnail)}
              alt={article?.title as string}
              layout="fill"
              objectFit="cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>
      </Link>
      <div className="pt-4">
        <Link href={`/${article?.id}`} className="hover:text-blue-500">
          {" "}
          <h1
            className={`mb-2 ${
              featured ? "text-6xl" : mediumFeature ? "text-3xl line-clamp-2" : "text-2xl line-clamp-2"
            }`}
          >
            {article?.title}
          </h1>
        </Link>
        <p className="text-xs text-gray-500 mb-2">
          {article?.User.name} -{" "}
          {convertDateFormat(article?.createdAt.toString())}
        </p>
        <p className="text-xs text-gray-500 mb-2">
          {article?.Genres?.map((genre: any) => genre.name).join(" / ")}
        </p>
        <p
          className={`text-gray-700 mb-4 ${
            featured
              ? "line-clamp-[9]"
              : mediumFeature
              ? "line-clamp-2"
              : "line-clamp-2"
          }`}
        >
          {article?.content}
        </p>
      </div>
    </div>
  );
}
