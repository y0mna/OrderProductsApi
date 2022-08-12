export type Order = {
	id?: number;
	status?: string;
	user_id: number;
};

export type OrderProduct = {
	id?: number;
	quantity?: number;
	product_id?: number;
	order_id?: number;
};

export type Product = {
	id?: number;
	name: string;
	price: number;
	category: string;
};

export type User = {
	id?: number;
	first_name?: string;
	last_name?: string;
	user_name: string;
	password: string;
	role?: string;
};
