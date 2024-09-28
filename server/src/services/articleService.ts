import { Article } from '../models/Article';
import elasticClient from '../config/elasticsearch';

export const indexArticle = async (article: any) => {
  try {
    const genres = await article.getGenres(); // Fetch genres associated with the article
    await elasticClient.index({
      index: 'articles',
      id: article.id.toString(),
      body: {
        title: article.title,
        content: article.content,
        author_id: article.author_id,
        thumbnail: article.thumbnail,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        genres: genres.map((genre: any) => genre.id),
        totalViews: parseInt(article.totalViews || '0', 10), // Initialize total views to 0
      },
    });
  } catch (error) {
    console.error('Error indexing article:', error);
  }
};

// Sync existing articles from the database into Elasticsearch
export const syncAllArticles = async () => {
  const articles = await Article.findAll({
    include: ['Genres'], // Ensure genres are loaded with the article
  });
  for (const article of articles) {
    await indexArticle(article);
  }
};