import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

// Define the attributes for the Genre model
interface GenreAttributes {
  id: Number;
  name: String;
}

// Optional fields for creating a new Genre (id is optional)
interface GenreCreationAttributes extends Optional<GenreAttributes, 'id'> {}

// Extend the Sequelize Model class
class Genre extends Model<GenreAttributes, GenreCreationAttributes> implements GenreAttributes {
  public id!: Number;
  public name!: String;
}

// Function to initialize the model
const initGenreModel = (sequelize: Sequelize) => {
  Genre.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Genre',
    tableName: 'Genres', // Explicitly define the table name
    timestamps: false, // No createdAt and updatedAt fields needed for genres
  });

  return Genre;
};

export default initGenreModel;
