/* import sqlite from "sqlite3";
import {Tables} from "../api/types/enums";
import {config} from "dotenv";
import {closeSqliteConnection} from "../api/utils/utils";

config({
	path: "../../.env",
});

const dbPath = process.env.DB_REFRESH_TOKEN_PATH || "";

const db = new sqlite.Database(dbPath, err =>
	err ? console.error(err) : console.log("Connected to the SQLite database")
);

db.serialize(() => {
	db.run(`DROP TABLE IF EXISTS ${Tables.refresh_tokens}`, err =>
		err
			? console.error(err)
			: console.log(`Table ${Tables.refresh_tokens} dropped successfully`)
	);
	db.run(
		`CREATE TABLE IF NOT EXISTS ${Tables.refresh_tokens} (
            "sub" INTEGER NOT NULL,
            "iat" INTEGER NOT NULL,
            "refresh_token" TEXT NOT NULL
        );`,
		err =>
			err
				? console.error(err)
				: console.log(`Table ${Tables.refresh_tokens} added successfully`)
	);
});

closeSqliteConnection(db);
 */
