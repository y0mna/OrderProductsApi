import { NextFunction, Request, Response } from 'express';
import Jwt, { JwtPayload } from 'jsonwebtoken';
import { Role } from '../helpers/enums';

export const roleAllowed =
	(role: Role) =>
	(req: Request, res: Response, next: NextFunction): void => {
		try {
			const authorizationHeader = req.headers.authorization;
			const token = (authorizationHeader as string).split(' ')[1];
			if ((Jwt.decode(token) as JwtPayload).user.role !== Role[role]) {
				throw new Error('User not authorized');
			}
			next();
		} catch (err) {
			res.status(403).json('User not authorized');
		}
	};
