import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

let {
	POSTGRES_HOST,
	POSTGRES_DATABASE,
	POSTGRES_USER,
	POSTGRES_PASSWORD,
	POSTGRES_DATABASE_TEST,
	POSTGRES_DATABASE_TEST_USER,
	POSTGRES_DATABASE_TEST_PASSWORD,
	ENV
} = process.env;

let Client =
	ENV === 'dev'
		? new Pool({
				host: POSTGRES_HOST,
				database: POSTGRES_DATABASE,
				user: POSTGRES_USER,
				password: POSTGRES_PASSWORD
		  })
		: new Pool({
				host: POSTGRES_HOST,
				database: POSTGRES_DATABASE_TEST,
				user: POSTGRES_DATABASE_TEST_USER,
				password: POSTGRES_DATABASE_TEST_PASSWORD
		  });

export default Client;
