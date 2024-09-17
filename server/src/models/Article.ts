import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// Define the attributes for the Article model
interface ArticleAttributes {
  id: number;
  title: string;
  content: string;
  thumbnail?: string;
  published_at: Date;
  author_id: number; // Foreign key to User
}

// Optional fields for creating a new Article (id and published_at are optional)
interface ArticleCreationAttributes extends Optional<ArticleAttributes, 'id' | 'published_at'> {}

// Extend the Sequelize Model class
class Article extends Model<ArticleAttributes, ArticleCreationAttributes> implements ArticleAttributes {
  public id!: number;
  public title!: string;
  public content!: string;
  public thumbnail?: string;
  public published_at!: Date;
  public author_id!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Function to initialize the model
const initArticleModel = (sequelize: Sequelize) => {
  Article.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING,
    },
    published_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    author_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', // Must reference the correct table name
        key: 'id',
      },
    },
  }, {
    sequelize,
    modelName: 'Article',
    tableName: 'Articles', // Explicitly define the table name
    timestamps: true,
  });

  return Article;
};


export default initArticleModel;
