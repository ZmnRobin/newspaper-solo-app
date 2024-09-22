import express, { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import db from "./models";
import userRoutes from "./routes/userRoute";
import articleRoutes from "./routes/articleRoute";
import genreRoute from "./routes/genreRoute";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import elasticClient from "./config/elasticsearch";
import { syncAllArticles } from "./services/articleService";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/'); // Define where to store files
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use timestamp for filenames
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Initialize Elasticsearch index
const initializeElasticIndex = async () => {
  const indexExists = await elasticClient.indices.exists({ index: 'articles' });
  if (!indexExists) {
    await elasticClient.indices.create({
      index: 'articles',
      body: {
        mappings: {
          properties: {
            title: { type: 'text' },
            content: { type: 'text' },
            author_id: { type: 'integer' },
            published_at: { type: 'date' },
          },
        },
      },
    });

    // Sync existing articles to Elasticsearch
    await syncAllArticles();
  }
};

initializeElasticIndex();

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Home route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hey there! Server is up and running now." });
});

// Synchronize the database without forcing
db.sequelize.sync({ alter: true }).then(() => {
  console.log("db has been re-synced");
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes(upload)); // Ensure article routes use multer for file upload
app.use('/api/genres', genreRoute);

// Listen on the server port
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
