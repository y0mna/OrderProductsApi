CREATE TABLE products(
    id serial primary key,
    name varchar not null unique,
    price float not null,
    category varchar not null
);