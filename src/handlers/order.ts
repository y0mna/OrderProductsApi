import express, { Request, Response } from 'express';
import { OrderStatus } from '../helpers/enums';
import { Order, OrderProduct } from '../helpers/types';
import { authenticate } from '../middlewares/authentication';
import { authorizedUser } from '../middlewares/authorized-user';
import { OrderStore } from '../models/order';
import { body, ValidationChain, validationResult } from 'express-validator';
import { ProductStore } from '../models/product';

const store = new OrderStore();
const productStore = new ProductStore();

const getUserActiveOrder = async (req: Request, res: Response): Promise<void> => {
	try {
		const order = await store.getUserActiveOrder(parseInt(req.params.id));
		res.json(order);
	} catch (error) {
		res.status(400).json(error);
	}
};

const getAllCompletedUserOrders = async (req: Request, res: Response): Promise<void> => {
	try {
		const orders = await store.getAllCompletedUserOrders(parseInt(req.params.id), OrderStatus.Completed);
		res.json(orders);
	} catch (error) {
		res.status(400).json(error);
	}
};

const create = async (req: Request, res: Response): Promise<void> => {
	try {
		const order: Order = {
			user_id: parseInt(req.params.id)
		};
		const newOrder = await store.create(order);
		res.json(newOrder);
	} catch (error) {
		res.status(400).json(error);
	}
};

const completeOrder = async (req: Request, res: Response): Promise<void> => {
	try {
		const order = await store.getOrderById(parseInt(req.params.order_id));
		if (!order) {
			res.status(404).json('Order not found');
			return;
		}
		if (order.user_id !== parseInt(req.params.id)) {
			res.status(400).json('Order does not belong to user');
			return;
		}
		const updatedOrder = await store.updateOrderStatus(parseInt(req.params.order_id), OrderStatus.Completed);
		res.json(updatedOrder);
	} catch (error) {
		res.status(400).json(error);
	}
};

const addOrderProductValidators = (): ValidationChain[] => {
	return [
		body('product_id')
			.exists()
			.withMessage('product_id is required')
			.bail()
			.notEmpty()
			.withMessage('product_id is required')
			.bail()
			.isInt({ gt: 0 })
			.withMessage('product_id must be an integer > 0')
			.bail(),
		body('quantity')
			.exists()
			.withMessage('quantity is required')
			.bail()
			.notEmpty()
			.withMessage('quantity is required')
			.bail()
			.isInt({ gt: 0 })
			.withMessage('quantity must be an integer > 0')
			.bail()
	];
};

const addProductsToOrder = async (req: Request, res: Response): Promise<void> => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.mapped() });
		return;
	}

	const order = await store.getOrderById(parseInt(req.params.order_id));
	if (!order) {
		res.status(404).json('Order not found');
		return;
	}
	if (order.status !== OrderStatus[OrderStatus.Active]) {
		res.status(400).json('Order not active');
		return;
	}
	const product = await productStore.show(parseInt(req.body.product_id));
	if (!product) {
		res.status(404).json('Product not found');
		return;
	}
	try {
		const orderProduct: OrderProduct = {
			order_id: parseInt(req.params.order_id),
			product_id: parseInt(req.body.product_id),
			quantity: parseInt(req.body.quantity)
		};
		const alreadyExistingOrderProduct = await store.getOrderProduct(orderProduct, parseInt(req.params.id));
		if (alreadyExistingOrderProduct) {
			const quantity = alreadyExistingOrderProduct.quantity + req.body.quantity;
			await store.updateOrderProductQuantity(alreadyExistingOrderProduct.id as number, quantity);
		} else {
			await store.addProductToOrder(orderProduct);
		}
		res.json(true);
	} catch (error) {
		res.status(400).json(error);
	}
};

const routes = (app: express.Application): void => {
	app.get('/users/:id/orders/active', authenticate, authorizedUser(), getUserActiveOrder);
	app.get('/users/:id/orders/completed', authenticate, authorizedUser(), getAllCompletedUserOrders);
	app.patch('/users/:id/orders/:order_id/complete', authenticate, authorizedUser(), completeOrder);
	app.post('/users/:id/orders', authenticate, authorizedUser(), create);
	app.post('/users/:id/orders/:order_id/products', addOrderProductValidators(), authenticate, authorizedUser(), addProductsToOrder);
};

export default routes;
