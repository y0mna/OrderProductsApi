import Client from '../database';
import { OrderStatus } from '../helpers/enums';
import { Order, OrderProduct } from '../helpers/types';

export class OrderStore {
	getOrderById = async (id: number): Promise<Order> => {
		try {
			const conn = await Client.connect();
			const sql = `SELECT * FROM orders WHERE id=$1`;
			const result = await conn.query(sql, [id]);
			conn.release();
			return result.rows[0];
		} catch (error) {
			throw new Error('unable to get order');
		}
	};

	getUserActiveOrder = async (user_id: number): Promise<Order> => {
		try {
			const conn = await Client.connect();
			const sql = `SELECT o.*, ARRAY_AGG(op.product_id) products FROM orders o LEFT JOIN orders_products op on op.order_id = o.id 
                         WHERE o.user_id=$1 and o.status=$2 GROUP BY o.id`;
			const result = await conn.query(sql, [user_id, OrderStatus[OrderStatus.Active]]);
			conn.release();
			return result.rows[0];
		} catch (error) {
			throw new Error('unable to get order');
		}
	};

	getAllCompletedUserOrders = async (user_id: number, status: OrderStatus): Promise<Order[]> => {
		try {
			const conn = await Client.connect();
			const sql = `SELECT o.*, ARRAY_AGG(op.product_id) products FROM orders o LEFT JOIN orders_products op on op.order_id = o.id
                         WHERE user_id=$1 and status=$2  GROUP BY o.id`;
			const result = await conn.query(sql, [user_id, OrderStatus[status]]);
			conn.release();
			return result.rows;
		} catch (error) {
			throw new Error('unable to get orders');
		}
	};

	create = async (order: Order): Promise<Order> => {
		try {
			const conn = await Client.connect();
			const sql = `INSERT INTO orders(user_id) values ($1) returning *`;
			const result = await conn.query(sql, [order.user_id]);
			conn.release();
			return result.rows[0];
		} catch (error) {
			throw new Error('unable to create order');
		}
	};

	addProductToOrder = async (order_product: OrderProduct): Promise<OrderProduct> => {
		try {
			const conn = await Client.connect();
			const sql = `INSERT INTO orders_products(order_id, product_id, quantity) values ($1, $2, $3) returning *`;
			const result = await conn.query(sql, [order_product.order_id, order_product.product_id, order_product.quantity]);
			conn.release();
			return result.rows[0];
		} catch (error) {
			throw new Error('unable to add product to order');
		}
	};

	updateOrderStatus = async (orderId: number, status: OrderStatus): Promise<Order> => {
		try {
			const conn = await Client.connect();
			const sql = `UPDATE orders set status=$1 WHERE id=$2 returning *`;
			const result = await conn.query(sql, [OrderStatus[status], orderId]);
			conn.release();
			return result.rows[0];
		} catch (error) {
			throw new Error('unable to update order');
		}
	};

	updateOrderProductQuantity = async (id: number, quantity: number) => {
		try {
			const conn = await Client.connect();
			const sql = `UPDATE orders_products SET quantity=$1 WHERE id=$2 returning *`;
			const result = await conn.query(sql, [quantity, id]);
			conn.release();
			return result.rows[0];
		} catch (error) {
			throw new Error('unable to update order product');
		}
	};

	getOrderProduct = async (order_product: OrderProduct, userId: number): Promise<OrderProduct> => {
		try {
			const conn = await Client.connect();
			const sql = `SELECT orders_products.* FROM orders_products INNER JOIN orders on orders.id=orders_products.order_id WHERE order_id=$1 AND product_id=$2 AND orders.user_id=$3`;
			const result = await conn.query(sql, [order_product.order_id, order_product.product_id, userId]);
			conn.release();
			return result.rows[0];
		} catch (error) {
			throw new Error('unable to add product to order');
		}
	};
}
