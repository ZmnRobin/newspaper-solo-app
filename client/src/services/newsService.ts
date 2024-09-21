// This file contains all the services related to news
import axios from "axios";
import axiosInstance from ".";
import { backendUrl } from "@/configs/constants";

// Articles services
export const getAllArticles = async (page: any) => {
  try {
    const response = await axios.get(
      `${backendUrl}/articles?page=${page}&limit=10`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all news:", error);
    throw error;
  }
};

export const getSingleArticlesById = async (id: any) => {
  try {
    const response = await axios.get(`${backendUrl}/articles/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching news with id ${id}:`, error);
    throw error;
  }
};

export const getArticlesByAuthor = async (authorId: any,page:any) => {
  try {
    const response = await axiosInstance.get(`${backendUrl}/articles?authorId=${authorId}&page=${page}&limit=10`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching articles by author:`, error);
    throw error;
  }
};

export const getArticlesByGenre = async (genreId: any,page:any) => {
  try {
    const response = await axios.get(`${backendUrl}/articles?genreId=${genreId}&page=${page}&limit=10`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching articles by genre:`, error);
    throw error;
  }
};

export const getRelatedArticles = async (articleId: any) => {
  try {
    const response = await axios.get(
      `${backendUrl}/articles?articleId=${articleId}&limit=6`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching related articles:`, error);
    throw error;
  }
};

export const searchArticles = async (query: any,page:any) => {
  try {
    const response = await axios.get(
      `${backendUrl}/articles?query=${encodeURIComponent(query)}&page=${page}&limit=10`
    );
    return response.data;
  } catch (error) {
    console.error(`Error searching articles:`, error);
    throw error;
  }
};

export const deleteArticleById = async (articleId: any) => {
  try {
    const response = await axiosInstance.delete(`/articles/${articleId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting article:`, error);
    throw error;
  }
};


// Genre services
export const getAllGenres = async () => {
  try {
    const response = await axios.get(`${backendUrl}/genres`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all genres:", error);
    throw error;
  }
};

export const createGenre = async (name: any) => {
  try {
    const response = await axiosInstance.post(`/genres`, { name });
    return response.data;
  } catch (error) {
    console.error(`Error creating genre:`, error);
    throw error;
  }
};

// Comment services
export const createComment = async (articleId: any, content: any) => {
  try {
    const response = await axiosInstance.post(
      `/articles/${articleId}/comments`,
      { content }
    );
    return response.data;
  } catch (error) {
    console.error(`Error creating comment:`, error);
    throw error;
  }
};

export const getCommentsByArticle = async (articleId: any) => {
  try {
    const response = await axiosInstance.get(`/articles/${articleId}/comments`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments:`, error);
    throw error;
  }
};

export const deleteCommentById = async (articleId: any, commentId: any) => {
  try {
    const response = await axiosInstance.delete(
      `/articles/${articleId}/comments/${commentId}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error deleting comment:`, error);
    throw error;
  }
};

export const updateCommentById = async (
  articleId: any,
  commentId: any,
  content: any
) => {
  try {
    const response = await axiosInstance.put(
      `/articles/${articleId}/comments/${commentId}`,
      { content }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating comment:`, error);
    throw error;
  }
};
