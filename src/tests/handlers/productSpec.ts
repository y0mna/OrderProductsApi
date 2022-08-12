process.env.ENV = 'test';
import { app } from '../../server';
import supertest from 'supertest';
import Client from '../../database';
import { Product, User } from '../../helpers/types';

const request = supertest(app);
let adminToken: string;
let createdProduct: Product;
let createdAdminUserDB: User;

describe('Test products endpoints suite', () => {
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

		// create an admin user
		const sql5 = `INSERT INTO users (first_name, last_name, user_name, password, role)
                      VALUES ('f_name', 'l_name', 'admin', '$2b$10$bwDGgJUxIcwxQr1sg7DmkO.DpH5ESxL0loRcKxfp.k3New/JPXIpW', 'Admin') returning *`;
		const userResponse = await conn.query(sql5);
		createdAdminUserDB = userResponse.rows[0];
		conn.release();

		// login and set the admin token
		const body = {
			username: createdAdminUserDB.user_name,
			password: 123456
		};
		const loginResponse = await request.post('/users/login').send(body);
		adminToken = loginResponse.body;
	});

	it('creates a product', async () => {
		const product: Product = {
			name: 'ppp',
			price: 100,
			category: 'catcat'
		};
		const response = await request
			.post('/products')
			.send(product)
			.set({ Authorization: 'Bearer ' + adminToken });
		createdProduct = response.body;
		expect(response.status).toBe(200);
		expect(response.body).toBeDefined();
		expect(response.body.name).toBe(product.name);
		expect(response.body.price).toBe(product.price);
		expect(response.body.category).toBe(product.category);
	});

	it('gets all products', async () => {
		const response = await request.get('/products').set({ Authorization: 'Bearer ' + adminToken });
		expect(response.status).toBe(200);
		expect(response.body).toBeDefined();
		expect(response.body).toHaveSize(1);
		expect(response.body[0].id).toBe(createdProduct.id);
	});

	it('gets product by id', async () => {
		const response = await request.get(`/products/${createdProduct.id}`).set({ Authorization: 'Bearer ' + adminToken });
		expect(response.status).toBe(200);
		expect(response.body).toBeDefined();
		expect(response.body.name).toBe(createdProduct.name);
		expect(response.body.price).toBe(createdProduct.price);
		expect(response.body.category).toBe(createdProduct.category);
	});

	it('gets products by category', async () => {
		const response = await request.get(`/products/categories/${createdProduct.category}`).set({ Authorization: 'Bearer ' + adminToken });
		expect(response.status).toBe(200);
		expect(response.body).toBeDefined();
		expect(response.body).toHaveSize(1);
		expect(response.body[0].id).toBe(createdProduct.id);
	});

	it('gets top 2 products', async () => {
		const response = await request.get(`/products/actions/top/2`).set({ Authorization: 'Bearer ' + adminToken });
		expect(response.status).toBe(200);
		expect(response.body).toBeDefined();
		expect(response.body).toHaveSize(0);
	});
});
