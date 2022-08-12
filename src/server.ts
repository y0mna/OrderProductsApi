import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';
import OrderRoutes from './handlers/order';
import ProductRoutes from './handlers/product';
import UserRoutes from './handlers/user';

const app: express.Application = express();
const port = 3000;
const address: string = `http://localhost:${port}`;

app.use(bodyParser.json());

// Rate limit Middleware
const rateLimitMiddleware = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100, // limit each ip to 100 req per windowMs
	message: 'Too many requests from this device'
});

// Cors Middleware
const corsMiddleware = cors({
	origin: `http://localhost::${port}`
});

// Attach Middlewares
app.use(morgan('common'), rateLimitMiddleware, helmet(), corsMiddleware);

app.get('/', function (_req: Request, res: Response) {
	res.send('Hello World!');
});

UserRoutes(app);
OrderRoutes(app);
ProductRoutes(app);

app.listen(port, async function () {
	console.log(`Server started on ${address}...`);
});

export { app };
