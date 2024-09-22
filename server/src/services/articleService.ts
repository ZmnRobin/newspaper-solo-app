import { Article } from '../models/Article';
import elasticClient from '../config/elasticsearch';

export const indexArticle = async (article: any) => {
  try {
    await elasticClient.index({
      index: 'articles',
      id: article.id.toString(),
      body: {
        title: article.title,
        content: article.content,
        author_id: article.author_id,
        published_at: article.published_at,
      },
    });
  } catch (error) {
    console.error('Error indexing article:', error);
  }
};

// Sync existing articles from the database into Elasticsearch
export const syncAllArticles = async () => {
  const articles = await Article.findAll();
  for (const article of articles) {
    await indexArticle(article);
  }
};
