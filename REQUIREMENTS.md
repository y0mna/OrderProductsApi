###### API Endpoints

# User Endpoints
1- create user (authentication , Admin user)
Request:
http://localhost:3000/users/  [POST]
body
{
    "firstname" : "l_name",
    "lastname" : "f_name",
    "username" : "test_user",   -> required
    "password" : 123456         -> required
}

Response:
user

2- user login (no auth)
Request:
http://localhost:3000/users/login [POST] 
body
{
   "username" : "admin",
   "password" : 123456
}

Response:
token

3- get users (authentication, Admin role)
Request
http://localhost:3000/users  [GET]

Response
array of users

4- get user (authentication, owner user)
Request
http://localhost:3000/users/:id [GET]

Response
user

# Orders Endpoints
1- create order (authentication, owner user)
Request
http://localhost:3000/users/:id/orders [POST]

Response
order

2- complete order (authentication, owner user)
Request
http://localhost:3000/users/:id/orders/complete [PATCH]

Response
order

3- get active user order (authentication, owner user)
Request
http://localhost:3000/users/:id/orders/active [GET]

Response
order

4- get user completed orders (authentication, owner user)
Request
http://localhost:3000/users/:id/orders/completed [GET]

Response
array of orders

5- add order product (authentication, owner user)
Request
http://localhost:3000/users/:id/orders/:id/products [POST]
body
{
    "product_id": 1,
    "quantity": 1 
}

Response
OrderProduct

# Products Endpoints
1- get products (authentication)
Request
http://localhost:3000/products [GET]

Response
array of products

2- get product (authentication)
Request
http://localhost:3000/products/:id [GET]

Response
product

3- get products by category (authentication)
Request
http://localhost:3000/products/categories/:category [GET]

Response
array of products

4- get top x products (authentication)
Request
http://localhost:3000/products/actions/top/:count [GET]

Response
array of products

5- create product (authentication, Admin role)
Request
http://localhost:3000/products [POST]
body
{
    "name": "ddd",
    "price": 10,
    "category": "any text"
}

Response
product

# #######################################################
###### Data Shapes

# Product
  id
  name
  price
  category

# User
  id
  first_name
  last_name
  user_name
  password
  role 'Admin' , 'User'

# Order
  id
  status 'Active' , 'Completed'
  user_id
  products  -> list of product ids belonging to this order

# #######################################################
###### Database schema

# users table
    id serial primary key,
    first_name varchar,
    last_name varchar,
    user_name varchar not null unique,
    password varchar(600) not null,
    role Role not null default 'User'

    Role -> 'Admin' , 'User'

# orders table
    id serial primary key,
    status OrderStatus not null default 'Active',
    user_id integer references users(id)

    OrderStatus -> 'Active' , 'Completed'

# products table
    id serial primary key,
    name varchar not null unique,
    price float not null,
    category varchar not null

# orders_products table
    id serial primary key,
    quantity integer not null,
    product_id integer references products(id),
    order_id integer references orders(id)
