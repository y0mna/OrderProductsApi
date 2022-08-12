# Hello Hello please check the following steps to run the project 

# 1-Copy the following commands in database terminal using (psql)
# dev
create database products_api_dev;
create user products_api_user password '123456';
grant all privileges on database products_api_dev to products_api_user;
\c products_api_dev

# test
create database products_api_test;
create user products_api_user_test password '123456';
grant all privileges on database products_api_test to products_api_user_test;
\c products_api_test

# 2-Create a .env file with the following fields
POSTGRES_HOST=127.0.0.1
POSTGRES_DATABASE=products_api_dev
POSTGRES_USER=products_api_user
POSTGRES_PASSWORD=123456
POSTGRES_DATABASE_TEST=products_api_test
POSTGRES_DATABASE_TEST_USER=products_api_user_test
POSTGRES_DATABASE_TEST_PASSWORD=123456
ENV=dev
SALT_ROUNDS=10
BCRYPT_PEPPER=testtesttest

# 3-Install dependencies and run the migrations
yarn
db-migrate up

# 4- Insert an admin user to test the endpoints with (username=admin , password=123456)
INSERT INTO users (first_name, last_name, user_name, password, role)
VALUES ('f_name', 'l_name', 'admin', '$2b$10$bwDGgJUxIcwxQr1sg7DmkO.DpH5ESxL0loRcKxfp.k3New/JPXIpW', 'Admin');

# 5- Use the login request to get the token for the admin user created
POST http://localhost:3000/users/login
body
{
   "username" : "admin",
   "password" : 123456
}

# 6- Here is the link for the postman collection to test the project

https://www.getpostman.com/collections/7403d3ee9ea0ee5ffb69

But first please create an environment and add the following variables to it
1- url   -> http://localhost:3000
2- token -> will be set automatically once you use the login request

# 7- Run the project
npm run build
npm run start
npm run test
