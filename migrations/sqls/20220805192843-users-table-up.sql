CREATE TYPE Role AS ENUM ('Admin', 'User');

CREATE TABLE users(
    id serial primary key,
    first_name varchar,
    last_name varchar,
    user_name varchar not null unique,
    password varchar(600) not null,
    role Role not null default 'User'
);