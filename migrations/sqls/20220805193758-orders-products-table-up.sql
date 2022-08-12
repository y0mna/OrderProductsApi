CREATE TABLE orders_products(
    id serial primary key,
    quantity integer not null,
    product_id integer references products(id),
    order_id integer references orders(id)
);