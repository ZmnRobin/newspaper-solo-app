import axios from "axios";
import axiosInstance from ".";
import { backendUrl } from "@/configs/constants";

export const getAllNews = async () => {
  try {
    const response = await axios.get(`${backendUrl}/articles`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all news:", error);
    throw error;
  }
};

export const getNewsById = async (id:any) => {
  try {
    const response = await axios.get(`${backendUrl}/articles/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching news with id ${id}:`, error);
    throw error;
  }
};

export const getAllGenres = async () => {
  try {
    const response = await axios.get(`${backendUrl}/genres`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all genres:", error);
    throw error;
  }
}

export const createComment=async (articleId:any,content:any)=>{
  try {
    const response = await axiosInstance.post(`/articles/${articleId}/comments`, { content });
    return response.data;
  } catch (error) {
    console.error(`Error creating comment:`, error);
    throw error;
  }
}

export const getCommentsByArticle=async (articleId:any)=>{
  try {
    const response = await axiosInstance.get(`/articles/${articleId}/comments`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments:`, error);
    throw error;
  }
}

export const getArticlesByAuthor=async (authorId:any)=>{
  try {
    const response = await axiosInstance.get(`/articles/author/${authorId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching articles by author:`, error);
    throw error;
  }
}

export const getArticlesByGenre=async (genreId:any)=>{
  try {
    const response = await axios.get(`${backendUrl}/articles/genre/${genreId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching articles by genre:`, error);
    throw error;
  }
}

export const getRelatedArticles=async (articleId:any)=>{
  try {
    const response = await axios.get(`${backendUrl}/articles/${articleId}/related`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching related articles:`, error);
    throw error;
  }
}

export const deleteArticleById=async (articleId:any)=>{
  try {
    const response = await axiosInstance.delete(`/articles/${articleId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting article:`, error);
    throw error;
  }
}
