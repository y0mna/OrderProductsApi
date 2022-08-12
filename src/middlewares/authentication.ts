import { NextFunction, Request, Response } from 'express';
import Jwt, { Secret } from 'jsonwebtoken';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
	try {
		const authorizationHeader = req.headers.authorization;
		const token = (authorizationHeader as string).split(' ')[1];
		Jwt.verify(token, process.env.BCRYPT_PEPPER as Secret);
		next();
	} catch (err) {
		if ((err as Error).name === 'TokenExpiredError') {
			res.status(401).json('Token expired');
			return;
		}
		res.status(401).json('Access denied, invalid token');
	}
};
