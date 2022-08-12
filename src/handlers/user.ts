import bcrypt from 'bcrypt';
import express, { Request, Response } from 'express';
import Jwt, { Secret } from 'jsonwebtoken';
import { Role } from '../helpers/enums';
import { User } from '../helpers/types';
import { authenticate } from '../middlewares/authentication';
import { authorizedUser } from '../middlewares/authorized-user';
import { roleAllowed } from '../middlewares/role-allowed';
import { UserStore } from '../models/user';
import { body, ValidationChain, validationResult } from 'express-validator';

const store = new UserStore();

const all = async (req: Request, res: Response): Promise<void> => {
	try {
		const users = await store.all();
		res.json(users);
	} catch (error) {
		res.status(400).json(error);
	}
};

const show = async (req: Request, res: Response): Promise<void> => {
	try {
		const user = await store.show(parseInt(req.params.id));
		res.json(user);
	} catch (error) {
		res.status(400).json(error);
	}
};

const createUserValidators = (): ValidationChain[] => {
	return [
		body('username').exists().withMessage('username is required').bail().notEmpty().withMessage('username is required').bail(),
		body('password').exists().withMessage('password is required').bail().notEmpty().withMessage('password is required').bail()
	];
};

const create = async (req: Request, res: Response): Promise<void> => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.mapped() });
		return;
	}
	const user: User = {
		first_name: req.body.firstname,
		last_name: req.body.lastname,
		user_name: req.body.username,
		password: req.body.password
	};
	try {
		const alreadyExistingUser = await store.getUserByUserName(user.user_name);
		if (alreadyExistingUser) {
			res.status(400).json('Sorry, username already exists !');
			return;
		}
		const createdUser = await store.create(user);
		res.json(createdUser);
	} catch (error) {
		res.status(400).json(error);
	}
};

const login = async (req: Request, res: Response): Promise<void> => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.mapped() });
		return;
	}
	const user: User = {
		user_name: req.body.username,
		password: req.body.password
	};
	try {
		const loggedInUser = await store.getUserByUserName(user.user_name);
		const doesPasswordMatch = bcrypt.compareSync(user.password + process.env.BCRYPT_PEPPER, loggedInUser.password);
		if (!loggedInUser || !doesPasswordMatch) {
			res.status(400).json('Cannot login, Please check the username and/or password');
			return;
		}
		const tokenUser = { id: loggedInUser.id, user_name: loggedInUser.user_name, role: loggedInUser.role };
		const token = Jwt.sign({ user: tokenUser }, process.env.BCRYPT_PEPPER as Secret, {
			expiresIn: 60 * 60
		});
		res.json(token);
	} catch (error) {
		res.status(400).json('Cannot login, Please check the username and/or password');
	}
};

const routes = (app: express.Application): void => {
	app.get('/users', authenticate, roleAllowed(Role.Admin), all);
	app.get('/users/:id', authenticate, authorizedUser(), show);
	app.post('/users', createUserValidators(), authenticate, roleAllowed(Role.Admin), create);
	app.post('/users/login', createUserValidators(), login);
};

export default routes;
