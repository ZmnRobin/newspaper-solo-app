import React, { useEffect, useState } from "react";
import { Articles, Comment } from "@/types/types";
import { createComment, deleteCommentById, getCommentsByArticle, getRelatedArticles, updateCommentById } from "@/services/newsService";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";
import RelatedArticles from "./RelatedArticles";
import Image from "next/image";
import { convertDateFormat, getImageSrc } from "@/utils/sharedFunction";

interface SingleArticleProps {
  article: Articles;
}

export default function SingleArticle({ article }: SingleArticleProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Articles[]>([]);

  const fetchComments = async () => {
    const data = await getCommentsByArticle(article.id);
    setComments(data);
  };

  const fetchRelatedArticles = async () => {
    const data = await getRelatedArticles(article.id);
    setRelatedArticles(data?.articles);
  };

  useEffect(() => {
    fetchRelatedArticles();
    fetchComments();
  }, []);

  // Pass both commentId and articleId for delete and update
  const handleCreateComment = async (content: string) => {
    await createComment(article.id, content);
    fetchComments(); // Update UI
  };

  const handleDeleteComment = async (commentId: number) => {
    await deleteCommentById(article.id, commentId);  // Pass articleId alongside commentId
    setComments((prev) => prev.filter((comment) => comment.id !== commentId)); // Update state locally
  };

  const handleUpdateComment = async (commentId: number, content: string) => {
    await updateCommentById(article.id, commentId, content); // Pass articleId alongside commentId
    setComments((prev) =>
      prev.map((comment) => (comment.id === commentId ? { ...comment, content } : comment))
    ); // Update state locally
  };

  return (
    <div className="container mx-auto px-5 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column - Author info */}
          <div className="lg:col-span-2 space-y-4">
          <div className="bg-white shadow p-4">
            <h2 className="font-bold text-lg mb-2">Author</h2>
            <p>{article.User.name}</p>
            <p className="text-sm text-gray-600">{article.User.email}</p>
          </div>
          <div className="bg-white shadow p-4">
            <h2 className="font-bold text-lg mb-2">Published</h2>
            <p>{convertDateFormat(article.published_at.toString())}</p>
            <p>{new Date(article.published_at).toLocaleTimeString()}</p>
          </div>
        </div>
        {/* Middle column - Article content */}
        <div className="lg:col-span-7 space-y-6">
          <h1 className="text-4xl font-bold">{article.title}</h1>
          {article?.thumbnail && (
            <div className="relative h-64 md:h-96">
              <Image
                  src={getImageSrc(article?.thumbnail)}
                  alt={article?.title as string}
                  layout="fill"
                  objectFit="cover"
              />
            </div>
          )}
          <div className="prose max-w-none text-xl font-medium">
            {article.content.split("\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>
          <CommentForm onCreate={handleCreateComment} />
          <CommentList
            comments={comments}
            onDelete={handleDeleteComment}
            onUpdate={handleUpdateComment}
          />
        </div>

        {/* Right column - Related articles */}
        <RelatedArticles articles={relatedArticles} />
      </div>
    </div>
  );
}
