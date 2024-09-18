import React, { useState } from "react";
import Modal from "../news/Modal";
import Link from "next/link";
import Image from "next/image";
import { getImageSrc } from "@/utils/sharedFunction";
import { FaTrash,FaEdit } from "react-icons/fa";
import { Article } from "@/configs/types";


interface MyArticleProps {
  articles: Article[];
  onDelete: (id: number) => void;
}

export default function MyArticle({ articles, onDelete }: MyArticleProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<number | null>(null);

  const handleDelete = (id: number) => {
    setIsModalOpen(true);
    setArticleToDelete(id);
  };

  const confirmDelete = () => {
    if (articleToDelete !== null) {
      onDelete(articleToDelete);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {articles.map((article) => (
          <div key={article.id} className="bg-white border p-4 rounded">
            <Link href={`/${article.id}`}>
              <div className="relative w-full h-60">
                <Image
                  src={getImageSrc(article?.thumbnail || "")}
                  alt={article?.title as string}
                  fill // This replaces layout="fill"
                  objectFit="cover"
                  className=""
                />
              </div>
            </Link>
            <h3 className="text-lg font-bold mb-2 mt-2">{article.title}</h3>
            <p className="text-sm mb-4 line-clamp-4">{article.content}</p>
            <p className="text-xs text-gray-500 mb-4">
              Published on: {new Date(article.createdAt).toLocaleDateString()}
            </p>
            <div className="flex space-x-2 justify-end">
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                <Link href={`/edit-article/${article.id}`}><FaEdit /></Link>
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => handleDelete(article.id)}
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        title="Confirm Delete"
        message="Are you sure you want to delete this article?"
        isOpen={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={confirmDelete}
      />
    </>
  );
}
