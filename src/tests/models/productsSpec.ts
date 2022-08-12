process.env.ENV = 'test';
import Client from '../../database';
import { Order, OrderProduct, Product, User } from '../../helpers/types';
import { OrderStore } from '../../models/order';
import { ProductStore } from '../../models/product';
import { UserStore } from '../../models/user';

const orderStore = new OrderStore();
const productStore = new ProductStore();
const userStore = new UserStore();
let createdProduct: Product;
let userId: number;

describe('Test products suite', () => {
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

	it('creates a product', async () => {
		const p: Product = {
			name: 'Duck',
			price: 20,
			category: 'Toys'
		};
		const product = await productStore.create(p);
		createdProduct = product;
		expect(createdProduct).toBeDefined();
		expect(createdProduct.name).toBe('Duck');
		expect(createdProduct.price).toBe(20);
		expect(createdProduct.category).toBe('Toys');
	});

	it('gets all products', async () => {
		const products = await productStore.all();
		expect(products).toBeDefined();
		expect(products).toHaveSize(1);
		expect(products[0].id).toBe(createdProduct.id);
	});

	it('gets a product by id', async () => {
		const product = await productStore.show(createdProduct.id as number);
		expect(product).toBeDefined();
		expect(product.name).toBe('Duck');
		expect(product.price).toBe(20);
		expect(product.category).toBe('Toys');
	});

	it('gets product by name', async () => {
		const product = await productStore.getProductByName(createdProduct.name);
		expect(product).toBeDefined();
		expect(product.name).toBe('Duck');
		expect(product.price).toBe(20);
	});

	it('gets products by category', async () => {
		const products = await productStore.getProductsByCatgory(createdProduct.category);
		expect(products).toBeDefined();
		expect(products).toHaveSize(1);
		expect(products[0].id).toBe(createdProduct.id);
	});

	it('get top 2 products', async () => {
		const p1: Product = {
			name: 'one',
			price: 200,
			category: 'Shoes'
		};
		const p2: Product = {
			name: 'two',
			price: 250,
			category: 'Shoes'
		};
		const p3: Product = {
			name: 'three',
			price: 250,
			category: 'Shoes'
		};
		const product1 = await productStore.create(p1);
		const product2 = await productStore.create(p2);
		const product3 = await productStore.create(p3);

		const order: Order = {
			user_id: userId
		};
		const createdOrder = await orderStore.create(order);

		const op1: OrderProduct = {
			quantity: 110,
			product_id: product1.id,
			order_id: createdOrder.id
		};
		const op2: OrderProduct = {
			quantity: 100,
			product_id: product2.id,
			order_id: createdOrder.id
		};
		const op3: OrderProduct = {
			quantity: 10,
			product_id: product3.id,
			order_id: createdOrder.id
		};
		await orderStore.addProductToOrder(op1);
		await orderStore.addProductToOrder(op2);
		await orderStore.addProductToOrder(op3);
		const products = await productStore.getTopProducts(2);
		expect(products).toBeDefined();
		expect(products).toHaveSize(2);
		expect(products[0].id).toBe(product1.id);
		expect(products[1].id).toBe(product2.id);
	});
});
