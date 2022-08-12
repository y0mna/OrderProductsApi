import Client from '../database';
import { Product } from '../helpers/types';

export class ProductStore {
	all = async (): Promise<Product[]> => {
		try {
			const conn = await Client.connect();
			const sql = `SELECT * FROM products`;
			const result = await conn.query(sql);
			conn.release();
			return result.rows;
		} catch (error) {
			throw new Error('unable to get products');
		}
	};

	show = async (productId: number): Promise<Product> => {
		try {
			const conn = await Client.connect();
			const sql = `SELECT * FROM products WHERE id=$1`;
			const result = await conn.query(sql, [productId]);
			conn.release();
			return result.rows[0];
		} catch (error) {
			throw new Error('unable to get product');
		}
	};

	getProductByName = async (name: string): Promise<Product> => {
		try {
			const conn = await Client.connect();
			const sql = `SELECT * FROM products WHERE name=$1`;
			const result = await conn.query(sql, [name]);
			conn.release();
			return result.rows[0];
		} catch (error) {
			throw new Error('unable to get product');
		}
	};

	getTopProducts = async (count: number): Promise<Product[]> => {
		try {
			const conn = await Client.connect();
			const sql = `select p.* from products p left join orders_products op on p.id = op.product_id 
            where p.id in (SELECT product_id FROM orders_products GROUP BY product_id ORDER BY sum(quantity) DESC limit ${count})`;
			const result = await conn.query(sql);
			conn.release();
			return result.rows;
		} catch (error) {
			throw new Error('unable to get products');
		}
	};

	getProductsByCatgory = async (category: string): Promise<Product[]> => {
		try {
			const conn = await Client.connect();
			const sql = `SELECT * FROM products where category=$1`;
			const result = await conn.query(sql, [category]);
			conn.release();
			return result.rows;
		} catch (error) {
			throw new Error('unable to get products');
		}
	};

	create = async (product: Product): Promise<Product> => {
		try {
			const conn = await Client.connect();
			const sql = `INSERT INTO products(name, price, category) values ($1, $2, $3) returning *`;
			const result = await conn.query(sql, [product.name, product.price, product.category]);
			conn.release();
			return result.rows[0];
		} catch (error) {
			throw new Error('unable to create product');
		}
	};
}
