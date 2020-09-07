/* import sqlite from "sqlite3";
import {config} from "dotenv";
import {Tables} from "../api/types/enums";
import {closeSqliteConnection} from "../api/utils/utils";

config({
	path: "../.env",
});

const dbPath = process.env.DB_PATH || "";

const db = new sqlite.Database(dbPath, err =>
	err ? console.error(err) : console.log("Connected to the SQLite database")
);

db.serialize(() => {
	db.run(`DROP TABLE IF EXISTS ${Tables.auth_users}`, err =>
		err ? console.error(err) : console.log(`Table ${Tables.auth_users} dropped successfully`)
	);
	db.run(
		`CREATE TABLE IF NOT EXISTS ${Tables.auth_users} (
            "id" TEXT NOT NULL UNIQUE PRIMARY KEY,
            "email" TEXT NOT NULL UNIQUE,
			"password" TEXT NOT NULL,
			"isVerified" BOOLEAN NOT NULL DEFAULT 0,
			"created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
			"updated_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );`,
		err =>
			err ? console.error(err) : console.log(`Table ${Tables.auth_users} added successfully`)
	);
});

closeSqliteConnection(db);
 */
