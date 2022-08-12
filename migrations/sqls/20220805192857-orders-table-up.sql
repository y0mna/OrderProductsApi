CREATE TYPE OrderStatus AS ENUM ('Active', 'Completed');

CREATE TABLE orders(
    id serial primary key,
    status OrderStatus not null default 'Active',
    user_id integer references users(id)
);