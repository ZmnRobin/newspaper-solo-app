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
import { createServer } from 'http'; // Import createServer from http
import { Server } from 'socket.io';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 5000;

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Replace '*' with your frontend URL in production for security
    methods: ["GET", "POST"]
  }
});

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
    cb(null, 'src/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
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
            thumbnail: { type: 'keyword' },
            createdAt: { type: 'date' },
            updatedAt: { type: 'date' },
            genres: { type: 'integer' },
            totalViews: { type: 'long' }
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

// Socket.io connection event
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Function to emit article indexing completion
export const emitArticleIndexed = (article: any) => {
  io.emit('articleIndexed', article);
};

// Start the server with httpServer instead of app.listen
httpServer.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
