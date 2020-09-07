import {Pool} from "pg";
import {config} from "dotenv";

config({
	path: ".env",
});

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: {
		rejectUnauthorized: false,
	},
});

const unconfigGetClient = (pool: Pool) => async () => {
	try {
		const client = await pool.connect();

		return client;
	} catch (e) {
		console.log(e);
	}
};

pool.on("error", err => {
	console.error("Unexpected pool error: ", err);
});

pool.on("connect", () => console.log("Connected to Node-PostgreSQL pool"));

const getClient = unconfigGetClient(pool);

export default getClient;
