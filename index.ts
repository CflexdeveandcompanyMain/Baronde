import "dotenv/config";
import connectDB from "./db";
import express, { Application, NextFunction, Request, Response } from "express";
import { createServer } from "http";
import cors from "cors"
import userroute from "./routes/userroute"
import imageroute from "./routes/imageroute"
import cartroute from "./routes/cartroute"
import orderroute from "./routes/orderroute"
const PORT = process.env.PORT || 3000;
const app: Application = express();
const httpServer = createServer(app);
app.use(express.json({limit: '500mb'}));


// const whitelist = [
//   'http://localhost:3000',
//   'http://localhost:3001',
//   'http://localhost:5173',
//   "*"
  
// ];

// const corsOptions = {
//   origin: function(origin: any, callback: any) {
//     if (!origin || whitelist.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
//   exposedHeaders: ['Authorization']
// };

app.use(cors({
  origin: "*",
  credentials: true,
  exposedHeaders: ['Authorization']
}));




app.use('/user/v1', userroute);
app.use('/image/v1', imageroute);
app.use('/cart/v1', cartroute);
app.use('/order/v1', orderroute);

app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path !== '/') {
        res.status(404).json({ message: 'Route Not Found' });
        return; 
    }
    next(); 
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