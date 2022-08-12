process.env.ENV = 'test';
import { app } from '../../server';
import supertest from 'supertest';
import Client from '../../database';
import { Order, OrderProduct, User } from '../../helpers/types';
import { OrderStatus } from '../../helpers/enums';

const request = supertest(app);
let adminToken: string;
let createdOrder: Order;
let createdAdminUserDB: User;

describe('Test orders endpoints suite', () => {

    beforeAll(async ()  => {
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
        }
        const loginResponse = await request.post('/users/login').send(body);
        adminToken = loginResponse.body;
    });

    it('creates an order', async () => {
        const o: Order = {
            user_id: createdAdminUserDB.id as number
        };
        const response = await request.post(`/users/${createdAdminUserDB.id}/orders`).send(o).set({ Authorization: 'Bearer ' + adminToken });
        createdOrder = response.body;        
        expect(response.status).toBe(200);
        expect(createdOrder).toBeDefined();
		expect(createdOrder.user_id).toBe(createdAdminUserDB.id as number);
		expect(createdOrder.status).toBe(OrderStatus[OrderStatus.Active]);
    });
        
    it('gets user active order', async () => {
        const response = await request.get(`/users/${createdAdminUserDB.id}/orders/active`).set({ Authorization: 'Bearer ' + adminToken });
        expect(response.status).toBe(200);
        expect(response.body).toBeDefined();
		expect(response.body.user_id).toBe(createdOrder.user_id);
		expect(response.body.status).toBe(createdOrder.status);
    });

    it('completes order', async () => {
        const response = await request.patch(`/users/${createdAdminUserDB.id}/orders/${createdOrder.id}/complete`).set({ Authorization: 'Bearer ' + adminToken });
        expect(response.status).toBe(200);
        console.log(response.body)
        expect(response.body).toBeDefined();
		expect(response.body.status).toBe(OrderStatus[OrderStatus.Completed]);    
    });

    it('gets user completed orders', async () => {
        const response = await request.get(`/users/${createdAdminUserDB.id}/orders/completed`).set({ Authorization: 'Bearer ' + adminToken });
		expect(response.body).toBeDefined();
		expect(response.body).toHaveSize(1);
		expect(response.body[0].id).toBe(createdOrder.id);
    });

    it('adds product to order', async () => {
        const op: OrderProduct = {
            order_id: createdOrder.id,
            quantity: 5
        };
        const response = await request.post(`/users/${createdAdminUserDB.id}/orders/${createdOrder.id}/products`).send(op).set({ Authorization: 'Bearer ' + adminToken });
        expect(response.status).toBe(400);
    });

});