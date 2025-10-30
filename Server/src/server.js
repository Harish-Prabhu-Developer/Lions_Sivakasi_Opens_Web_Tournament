// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './Config/db.js';
import router from './Routes/index.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: ["http://localhost:5000", "https://lionsivakasiopen.netlify.app","http://10.85.78.247:5173","http://10.181.228.247:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/v1', router);

app.get('/', (req, res) => {
    res.json({ message: 'Tournament API Server Running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        msg: err.message || 'Server Error',
    });
});

const PORT = process.env.PORT || 5000;

// ⚠️ IMPORTANT: Connect to DB first, then start server
const startServer = async () => {
    try {
        await connectDB(); // Wait for DB connection
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
