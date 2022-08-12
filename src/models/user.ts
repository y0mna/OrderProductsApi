import bcrypt from 'bcrypt';
import Client from '../database';
import { User } from '../helpers/types';

export class UserStore {
	all = async (): Promise<User[]> => {
		try {
			const conn = await Client.connect();
			const sql = `SELECT * FROM users`;
			const result = await conn.query(sql);
			conn.release();
			return result.rows;
		} catch (error) {
			throw new Error('unable to get users');
		}
	};

	create = async (user: User): Promise<User> => {
		try {
			const conn = await Client.connect();
			const sql = `INSERT INTO users(first_name, last_name, user_name, password) values ($1, $2, $3, $4) returning *`;
			const hash = bcrypt.hashSync(user.password + process.env.BCRYPT_PEPPER, parseInt(process.env.SALT_ROUNDS as string));

			const result = await conn.query(sql, [user.first_name, user.last_name, user.user_name, hash]);
			conn.release();
			return result.rows[0];
		} catch (error) {
			throw new Error('unable to create user');
		}
	};

	show = async (userId: number): Promise<User> => {
		try {
			const conn = await Client.connect();
			const sql = `SELECT * FROM users WHERE id=$1`;
			const result = await conn.query(sql, [userId]);
			conn.release();
			return result.rows[0];
		} catch (error) {
			throw new Error('unable to get user');
		}
	};

	getUserByUserName = async (userName: string): Promise<User> => {
		try {
			const conn = await Client.connect();
			const sql = `SELECT * FROM users WHERE user_name=$1`;
			const result = await conn.query(sql, [userName]);
			conn.release();
			return result.rows[0];
		} catch (error) {
			throw new Error('unable to get user');
		}
	};
}
