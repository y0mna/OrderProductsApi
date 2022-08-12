import { NextFunction, Request, Response } from 'express';
import Jwt, { JwtPayload } from 'jsonwebtoken';

export const authorizedUser =
	(reqObject: string = 'param') =>
	(req: Request, res: Response, next: NextFunction): void => {
		try {
			const authorizationHeader = req.headers.authorization;
			const token = (authorizationHeader as string).split(' ')[1];
			const userId = reqObject === 'param' ? req.params.id : req.body.id;
			if ((Jwt.decode(token) as JwtPayload).user.id !== parseInt(userId)) {
				throw new Error('User id does not match!');
			}
			next();
		} catch (err) {
			res.status(401).json('User not authorized');
		}
	};
