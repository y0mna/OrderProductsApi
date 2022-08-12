process.env.ENV = 'test';
import Client from '../../database';
import { OrderStatus } from '../../helpers/enums';
import { Order, Product, OrderProduct, User } from '../../helpers/types';
import { OrderStore } from '../../models/order';
import { ProductStore } from '../../models/product';
import { UserStore } from '../../models/user';

const orderStore = new OrderStore();
const productStore = new ProductStore();
const userStore = new UserStore();
let userId: number;
let orderId: number = 0;
let createdOrderProductId: number = 0;
let createdProductId: number = 0;

describe('Test orders suite', () => {
	beforeAll(async () => {
		const conn = await Client.connect();
		const sql1 = `DELETE FROM orders_products`;
		const sql2 = `DELETE FROM orders`;
		const sql3 = `DELETE FROM products`;
		const sql4 = `DELETE FROM users`;
		await conn.query(sql1);
		await conn.query(sql2);
		await conn.query(sql3);
		await conn.query(sql4);
		conn.release();

		const u: User = {
			first_name: 'fname',
			last_name: 'lname',
			user_name: 'yomna',
			password: '123456'
		};
		const user = await userStore.create(u);
		userId = user.id as number;
	});

	it('creates an order', async () => {
		const order: Order = {
			user_id: userId
		};
		const createdOrder = await orderStore.create(order);
		orderId = createdOrder.id as number;
		expect(createdOrder).toBeDefined();
		expect(createdOrder.user_id).toBe(userId);
		expect(createdOrder.status).toBe(OrderStatus[OrderStatus.Active]);
	});

	it('gets order by id', async () => {
		const order = await orderStore.getOrderById(orderId);
		expect(order).toBeDefined();
		expect(order.user_id).toBe(userId);
		expect(order.status).toBe(OrderStatus[OrderStatus.Active]);
	});

	it('gets user active order', async () => {
		const order = await orderStore.getUserActiveOrder(userId);
		expect(order).toBeDefined();
		expect(order.user_id).toBe(userId);
		expect(order.status).toBe(OrderStatus[OrderStatus.Active]);
	});

	it('adds product to an order', async () => {
		const product: Product = {
			name: 'Oppo',
			price: 1000,
			category: 'Mobile'
		};
		const createdProduct = await productStore.create(product);
		createdProductId = createdProduct.id as number;
		const orderProduct: OrderProduct = {
			quantity: 3,
			product_id: createdProductId as number,
			order_id: orderId
		};
		const createdOrderProduct = await orderStore.addProductToOrder(orderProduct);
		createdOrderProductId = createdOrderProduct.id as number;
		expect(createdOrderProduct).toBeDefined();
		expect(createdOrderProduct.order_id).toBe(orderId);
		expect(createdOrderProduct.product_id).toBe(createdProductId);
		expect(createdOrderProduct.quantity).toBe(orderProduct.quantity);
	});

	it('updates an order product quantity', async () => {
		const orderProduct = await orderStore.updateOrderProductQuantity(createdOrderProductId, 10);
		expect(orderProduct).toBeDefined();
		expect(orderProduct.order_id).toBe(orderId);
		expect(orderProduct.product_id).toBe(createdProductId);
		expect(orderProduct.quantity).toBe(10);
	});

	it('gets an order product', async () => {
		const op: OrderProduct = {
			order_id: orderId,
			product_id: createdProductId
		};
		const orderProduct = await orderStore.getOrderProduct(op, userId);
		expect(orderProduct).toBeDefined();
		expect(orderProduct.order_id).toBe(orderId);
		expect(orderProduct.product_id).toBe(createdProductId);
		expect(orderProduct.quantity).toBe(10);
	});

	it('updates an order status', async () => {
		const order = await orderStore.updateOrderStatus(orderId, OrderStatus.Completed);
		expect(order).toBeDefined();
		expect(order.user_id).toBe(userId);
		expect(order.status).toBe(OrderStatus[OrderStatus.Completed]);
	});

	it('gets user completed orders', async () => {
		const orders = await orderStore.getAllCompletedUserOrders(userId, OrderStatus.Completed);
		expect(orders).toBeDefined();
		expect(orders).toHaveSize(1);
		expect(orders[0].status).toBe(OrderStatus[OrderStatus.Completed]);
	});
});
