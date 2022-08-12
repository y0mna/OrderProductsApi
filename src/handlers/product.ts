import express, { Request, Response } from 'express';
import { Role } from '../helpers/enums';
import { Product } from '../helpers/types';
import { authenticate } from '../middlewares/authentication';
import { roleAllowed } from '../middlewares/role-allowed';
import { ProductStore } from '../models/product';
import { body, ValidationChain, validationResult } from 'express-validator';

const store = new ProductStore();

const all = async (req: Request, res: Response): Promise<void> => {
	try {
		const products = await store.all();
		res.json(products);
	} catch (error) {
		res.status(400).json(error);
	}
};

const show = async (req: Request, res: Response): Promise<void> => {
	try {
		const product = await store.show(parseInt(req.params.id));
		res.json(product);
	} catch (error) {
		res.status(400).json(error);
	}
};

const getTopProducts = async (req: Request, res: Response): Promise<void> => {
	try {
		const products = await store.getTopProducts(parseInt(req.params.count));
		res.json(products);
	} catch (error) {
		res.status(400).json(error);
	}
};

const getProductsByCatgory = async (req: Request, res: Response): Promise<void> => {
	try {
		const products = await store.getProductsByCatgory(req.params.category);
		res.json(products);
	} catch (error) {
		res.status(400).json(error);
	}
};

const addProductValidators = (): ValidationChain[] => {
	return [
		body('name').exists().withMessage('name is required').bail().notEmpty().withMessage('name is required').bail(),
		body('price')
			.exists()
			.withMessage('price is required')
			.bail()
			.notEmpty()
			.withMessage('price is required')
			.bail()
			.isInt({ gt: 0 })
			.withMessage('price must be an integer > 0')
			.bail(),
		body('category').exists().withMessage('category is required').bail().notEmpty().withMessage('category is required').bail()
	];
};

const create = async (req: Request, res: Response): Promise<void> => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.mapped() });
		return;
	}
	const product = await store.getProductByName(req.body.name);
	if (product) {
		res.status(400).json('Product name already exists !');
		return;
	}
	try {
		const product: Product = {
			name: req.body.name,
			price: Number(req.body.price),
			category: req.body.category
		};
		const newProduct = await store.create(product);
		res.json(newProduct);
	} catch (error) {
		res.status(400).json(error);
	}
};

const routes = (app: express.Application): void => {
	app.get('/products', authenticate, all);
	app.get('/products/:id', authenticate, show);
	app.get('/products/categories/:category', authenticate, getProductsByCatgory);
	app.get('/products/actions/top/:count', authenticate, getTopProducts);
	app.post('/products', addProductValidators(), authenticate, roleAllowed(Role.Admin), create);
};

export default routes;
