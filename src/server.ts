import express from 'express';
import userRouter from './routes/UserRouter';
import postRouter from './routes/PostRoutes';
import profileRouter from './routes/ProfileRoutes';
import { config } from 'dotenv';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';

config();

const app = express();

const port = process.env.PORT;

app.use(
    bodyParser.json(),
    profileRouter,
    userRouter,
    postRouter
);

app.get("/", (req: Request, res: Response) => {
    res.status(200).send('<h1> API POSTS </h1>')
})

app.listen(port, () => {
    console.log(`Listening on ${port}`);
});
