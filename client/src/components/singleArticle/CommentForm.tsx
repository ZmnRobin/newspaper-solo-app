import React, { useState } from "react";

interface CommentFormProps {
  onCreate: (content: string) => void;
}

export default function CommentForm({ onCreate }: CommentFormProps) {
  const [comment, setComment] = useState("");

  const handleCreateComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onCreate(comment);
      setComment("");
    }
  };

  return (
    <form className="mt-4" onSubmit={handleCreateComment}>
      <textarea
        className="w-full border p-2"
        placeholder="Write your comment here . . ."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      ></textarea>
      <button className="bg-blue-500 text-white px-4 py-2 mt-2">Create Comment</button>
    </form>
  );
}
