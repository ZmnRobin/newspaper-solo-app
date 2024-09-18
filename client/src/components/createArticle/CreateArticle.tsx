"use client";
import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // React Quill's styles
import axios from 'axios';
import { backendUrl } from '@/configs/constants';
import axiosInstance from '@/services';
import { useRouter } from 'next/navigation';

interface Genre {
  id: number;
  name: string;
}

export default function CreateArticle() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch genres from the backend
    const fetchGenres = async () => {
      try {
        const response = await axios.get(`${backendUrl}/genres`); // Adjust the API route accordingly
        setGenres(response.data);
      } catch (error) {
        console.error('Error fetching genres:', error);
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

    formData.append('title', title);
    formData.append('content', content);
    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }
    // Append genre IDs as separate entries
    selectedGenres.forEach((genreId) => {
      formData.append('genreIds[]', genreId.toString());
    });

    try {

      const response = await axiosInstance.post(`${backendUrl}/articles`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Article created:', response.data);
      alert('Article created successfully!');
      router.push('/'); // Redirect to the home page
    } catch (error) {
      console.error('Error creating article:', error);
      alert('An error occurred while creating the article');
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
      {thumbnailPreview && <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full mt-2" />}

      
      {/* Genre Selection */}
      <h2 className="text-lg font-bold">Select Genres</h2>
      <div className="flex flex-wrap gap-2">
        {genres.map((genre) => (
          <span
            key={genre.id}
            onClick={() => handleGenreToggle(genre.id)}
            className={`cursor-pointer px-3 py-1 rounded-full text-white ${
              selectedGenres.includes(genre.id) ? 'bg-blue-500' : 'bg-gray-500'
            }`}
          >
            {genre.name}
          </span>
        ))}
      </div>

      {/* React Quill Editor for Content */}
      {/* <ReactQuill value={content} onChange={setContent} className="bg-white mt-2" placeholder='Start your writing . . .' /> */}

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
        Create Article
      </button>
    </form>
  );
}
