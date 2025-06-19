import "dotenv/config";
import connectDB from "./db";
import express, { Application } from "express";
import { createServer } from "http";
const PORT = process.env.PORT || 3000;
const app: Application = express();
const httpServer = createServer(app);
app.use(express.json());


app.use('/', (req, res) => {
  res.status(200).json({
    message: "API is working"
  });
});


connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });


process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});