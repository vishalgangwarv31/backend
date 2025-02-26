import express, { Request, Response } from 'express';
import  adminRoutes  from './routes/adminRouter'
import userRoutes from './routes/userRoutes';
import firmRouter from './routes/firmRouter';
import dotenv from "dotenv"
import cors from 'cors'

const app = express();
const PORT  = 3000;

const corsOptions = {
    origin: 'http://localhost:5173', 
  };
app.use(cors(corsOptions));
  
app.use(express.json())


dotenv.config();


app.get('/', (req : Request,res : Response) =>{
    res.send("hello");
})

app.use('/api/admin',adminRoutes);
app.use('/api/user',userRoutes);
app.use('/api/firm',firmRouter);

app.listen(PORT, () =>{
    console.log("sd,jf");
})