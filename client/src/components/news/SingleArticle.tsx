import { Articles } from "@/configs/types";
import {
  createComment,
  getCommentsByArticle,
  getRelatedArticles,
} from "@/services/newsService";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Modal from "./Modal";
import { convertDateFormat, getImageSrc } from "@/utils/sharedFunction";
import Link from "next/link";


interface SingleArticleProps {
  article: Articles;
}

interface Comment {
  id: Number;
  content: string;
  User: {
    name: string;
  };
  createdAt: string;
}

export default function SingleArticle({ article }: SingleArticleProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [relatedArticles, setRelatedArticles] = useState<Articles[]>([]);
  const [comment, setComment] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // State for the modal
  const router = useRouter();

  // fetch comments
  const fetchComments = async () => {
    const data = await getCommentsByArticle(article.id);
    setComments(data);
  };

  // fetch related articles
  const fetchRelatedArticles = async () => {
    const data = await getRelatedArticles(article.id);
    setRelatedArticles(data);
  };

  useEffect(() => {
    fetchRelatedArticles();
    fetchComments();
  }, []);

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = Cookies.get("user");
    if (!user) {
      setIsModalOpen(true); // Open the modal when the user is not logged in
    } else {
      try {
        const data = await createComment(article.id, comment);
        if (data) {
          fetchComments();
        }
        setComment("");
      } catch (err) {
        console.error("Error creating comment:", err);
      }
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false); // Close the modal without redirecting
  };

  const handleModalOk = () => {
    setIsModalOpen(false);
    router.push("/login"); // Redirect to the login page
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
            <p>{new Date(article.published_at).toLocaleDateString()}</p>
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
          <div className="mt-8">
            <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>
            <form className="mt-4" onSubmit={handleCreateComment}>
              <textarea
                className="w-full border p-2"
                placeholder="write your comment here . . ."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
              ></textarea>
              <button className="bg-blue-500 text-white px-4 py-2 mt-2 items-end">
                Create Comment
              </button>
            </form>
            <div className="mt-4 space-y-4">
              {comments?.map((comment, index) => (
                <div key={index} className="bg-white shadow p-4 rounded-lg">
                  <h3 className="font-semibold">
                    {comment?.User?.name} .{" "}
                    <span className="text-xs text-gray-500">
                      {convertDateFormat(comment?.createdAt)}
                    </span>
                  </h3>
                  <p>{comment?.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Related news */}
        <div className="lg:col-span-3">
          <div className="bg-white shadow p-4">
            <h2 className="font-bold text-xl mb-4">Related Articles</h2>
            <div className="space-y-4">
              {/* Related articles logic */}
              {relatedArticles?.map((article, index) => (
                <div key={index} className="">
                  {/* Container with fixed dimensions */}
                  <Link href={`/${article.id}`}><div className="relative w-full h-40">
                    <Image
                        src={getImageSrc(article?.thumbnail || "")}
                        alt={article?.title as string}
                      fill // This replaces layout="fill"
                      objectFit="cover"
                      className=""
                    />
                  </div></Link>
                  <div className="mt-1">
                    <Link href={`/${article.id}`}>
                      <h3 className="font-semibold hover:text-sky-500">{article?.title}</h3>
                    </Link>
                    <p className="text-sm text-gray-500">
                      {article?.User.name} . <span className="text-xs text-gray-500">
                      {convertDateFormat(article?.createdAt.toString())}
                    </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for comment protection */}
      <Modal
        title="Login Required"
        message="You need to log in before you can create a comment."
        isOpen={isModalOpen}
        onCancel={handleModalCancel}
        onOk={handleModalOk}
      />
    </div>
  );
}
