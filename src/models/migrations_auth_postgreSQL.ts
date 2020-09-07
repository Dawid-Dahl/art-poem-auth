import {Pool} from "pg";
import {config} from "dotenv";
import {Tables} from "../api/types/enums";

(async () => {
	config({
		path: "../../.env",
	});

	const pool = new Pool({
		connectionString: process.env.DATABASE_URL,
		ssl: {
			rejectUnauthorized: false,
		},
	});

	const client = await pool.connect();

	try {
		await client.query("BEGIN");

		await client.query(`DROP TABLE IF EXISTS ${Tables.auth_users}`, []);

		const sqlAuthUsers = `CREATE TABLE IF NOT EXISTS ${Tables.auth_users} (
            "id" TEXT NOT NULL UNIQUE PRIMARY KEY,
            "email" TEXT NOT NULL UNIQUE,
			"password" TEXT NOT NULL,
			"isVerified" BOOLEAN NOT NULL DEFAULT FALSE,
			"created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			"updated_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );`;

		await client.query(sqlAuthUsers, []);

		console.log(`Table ${Tables.auth_users} created!`);

		await client.query(`DROP TABLE IF EXISTS ${Tables.refresh_tokens}`, []);

		const sqlRefreshTokens = `CREATE TABLE IF NOT EXISTS ${Tables.refresh_tokens} (
            "sub" TEXT NOT NULL,
            "iat" INTEGER NOT NULL,
            "refresh_token" TEXT NOT NULL
        );`;

		await client.query(sqlRefreshTokens, []);

		console.log(`Table ${Tables.refresh_tokens} created!`);

		await client.query("COMMIT");
	} catch (e) {
		await client.query("ROLLBACK");
		throw e;
	} finally {
		client.release();
	}
})().catch(e => console.log(e));
