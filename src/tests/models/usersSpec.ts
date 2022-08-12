process.env.ENV = 'test';
import Client from '../../database';
import { User } from '../../helpers/types';
import { UserStore } from '../../models/user';

const userStore = new UserStore();
let createdUser: User;

describe('Test users suite', () => {
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
	});

	it('creates a user', async () => {
		const u: User = {
			first_name: 'fname',
			last_name: 'lname',
			user_name: 'yomna',
			password: '123456'
		};
		const user = await userStore.create(u);
		createdUser = user;
		expect(user).toBeDefined();
		expect(user.first_name).toBe('fname');
		expect(user.last_name).toBe('lname');
		expect(user.user_name).toBe('yomna');
	});

	it('gets all users', async () => {
		const users = await userStore.all();
		expect(users).toBeDefined();
		expect(users).toHaveSize(1);
		expect(users[0].id).toBe(createdUser.id);
	});

	it('gets a user by id', async () => {
		const user = await userStore.show(createdUser.id as number);
		expect(user).toBeDefined();
		expect(user.first_name).toBe(createdUser.first_name);
		expect(user.last_name).toBe(createdUser.last_name);
		expect(user.user_name).toBe(createdUser.user_name);
	});

	it('gets user by username', async () => {
		const user = await userStore.getUserByUserName(createdUser.user_name);
		expect(user).toBeDefined();
		expect(user.id).toBe(createdUser.id);
		expect(user.first_name).toBe(createdUser.first_name);
		expect(user.last_name).toBe(createdUser.last_name);
		expect(user.user_name).toBe(createdUser.user_name);
	});
});
