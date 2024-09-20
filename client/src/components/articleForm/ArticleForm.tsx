"use client";
import React, { useState, useEffect } from "react";
import axiosInstance from "@/services";
import { useRouter } from "next/navigation";
import { backendUrl } from "@/configs/constants";
import { getImageSrc } from "@/utils/sharedFunction";

interface Genre {
  id: number;
  name: string;
}

interface ArticleFormProps {
  article?: {
    title: string;
    content: string;
    thumbnail: string;
    Genres: Genre[]; 
  };
  editId?: string;
}

export default function ArticleForm({ article, editId }: ArticleFormProps) {
  const [title, setTitle] = useState(article?.title || "");
  const [content, setContent] = useState(article?.content || "");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(article?.thumbnail || null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>(
    article?.Genres ? article.Genres.map((genre) => genre.id) : [] // Initialize state with genre IDs
  );
  const router = useRouter();

  useEffect(() => {
    // Fetch genres from the backend
    const fetchGenres = async () => {
      try {
        const response = await axiosInstance.get(`${backendUrl}/genres`);
        setGenres(response.data);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, []);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
    }
  };

  const handleGenreToggle = (id: number) => {
    setSelectedGenres((prevGenres) =>
      prevGenres.includes(id) ? prevGenres.filter((genreId) => genreId !== id) : [...prevGenres, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }
    selectedGenres.forEach((genreId) => {
      formData.append("genreIds[]", genreId.toString());
    });

    try {
      if (editId) {
        // Update article
        await axiosInstance.put(`${backendUrl}/articles/${editId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Article updated successfully!");
      } else {
        // Create new article
        await axiosInstance.post(`${backendUrl}/articles`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Article created successfully!");
      }
      router.push("/profile");
    } catch (error) {
      console.error(editId ? "Error updating article" : "Error creating article", error);
      alert("An error occurred while submitting the article");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      {/* Title */}
      <input
        type="text"
        placeholder="Give a title to your article"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-2xl font-bold p-2 border border-gray-300 rounded"
        required
      />

      {/* Thumbnail Upload */}
      <input type="file" accept="image/*" onChange={handleThumbnailChange} className="w-full border p-2" />
      {/* Show the selected thumbnail if present, otherwise the existing one */}
      {thumbnailPreview && <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full mt-2" />}
      {!thumbnail && article?.thumbnail && (
        <img src={getImageSrc(article?.thumbnail)} alt="Existing thumbnail" className="w-full mt-2" />
      )}

      {/* Genre Selection */}
      <h2 className="text-lg font-bold">Select Genres</h2>
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <span
            key={genre.id}
            onClick={() => handleGenreToggle(genre.id)}
            className={`cursor-pointer px-3 py-1 rounded-full text-white ${
              selectedGenres.includes(genre.id) ? "bg-blue-500" : "bg-gray-500"
            }`}
          >
            {genre.name}
          </span>
        ))}
      </div>

      {/* Content */}
      <textarea
        placeholder="Write your article content here . . ."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full h-64 p-2 border border-gray-300 rounded"
        required
      ></textarea>

      {/* Submit Button */}
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mb-5">
        {editId ? "Update Article" : "Create Article"}
      </button>
    </form>
  );
}
