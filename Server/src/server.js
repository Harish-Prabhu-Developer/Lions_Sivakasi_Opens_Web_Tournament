import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './Routes/index.js';

dotenv.config();
const app = express();
app.use(cors(
    {
        origin:["http://localhost:5000","http://localhost:3000"],
        methods:["GET","POST","PUT","DELETE"],
        credentials: true
    }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1',router);
app.get('/', (req, res) => {
    res.send('Hello World!');
})
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
