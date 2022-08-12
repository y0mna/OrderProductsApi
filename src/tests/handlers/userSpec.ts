process.env.ENV = 'test';
import { app } from '../../server';
import supertest from 'supertest';
import Client from '../../database';
import { User } from '../../helpers/types';

const request = supertest(app);
let userToken: string;
let adminToken: string;
let createdUser: { firstname: string; lastname: string; username: string; password: string };
let createdUserDB: User;
let createdAdminUserDB: User;

describe('Test users endpoints suite', () => {
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

	it('create a user', async () => {
		const body = {
			firstname: 'ppp',
			lastname: 'lll',
			username: 'kkkk',
			password: '123456'
		};
		const response = await request
			.post('/users')
			.send(body)
			.set({ Authorization: 'Bearer ' + adminToken });
		createdUser = body;
		createdUserDB = response.body;
		expect(response.status).toBe(200);
		expect(createdUserDB).toBeDefined();
		expect(createdUserDB.first_name).toBe(createdUser.firstname);
		expect(createdUserDB.last_name).toBe(createdUser.lastname);
		expect(createdUserDB.user_name).toBe(createdUser.username);
	});

	it('login', async () => {
		const body = {
			username: createdUser.username,
			password: createdUser.password
		};
		const response = await request.post('/users/login').send(body);
		userToken = response.body;
		expect(response.status).toBe(200);
		expect(response.body).toBeDefined();
	});

	it('gets user by id', async () => {
		const response = await request.get(`/users/${createdUserDB.id}`).set({ Authorization: 'Bearer ' + userToken });
		expect(response.status).toBe(200);
		const user = response.body;
		expect(user).toBeDefined();
		expect(user.first_name).toBe(createdUserDB.first_name);
		expect(user.last_name).toBe(createdUserDB.last_name);
		expect(user.user_name).toBe(createdUserDB.user_name);
	});

	it('gets all users', async () => {
		const response = await request.get('/users').set({ Authorization: 'Bearer ' + adminToken });
		expect(response.status).toBe(200);
		const users = response.body;
		expect(users).toHaveSize(2);
		expect(users[0].id).toBe(createdAdminUserDB.id);
		expect(users[1].id).toBe(createdUserDB.id);
	});
});
