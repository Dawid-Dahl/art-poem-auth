import path from "path";
import fs from "fs";
import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import {Tables} from "../types/enums";
import {DecodedJwt} from "../types/types";
import {authJsonResponse, removeBearerFromTokenHeader, releaseClient} from "../utils/utils";
import getClient from "../../db/db";
import {PoolClient} from "pg";

const PUB_KEY_PATH = path.join(__dirname, "../..", "cryptography", "id_rsa_pub.pem");
const PUB_KEY = fs.readFileSync(PUB_KEY_PATH, "utf8");

export const deleteUserController = (req: Request, res: Response, next: NextFunction) => {
	const xToken = removeBearerFromTokenHeader(req.get("x-token"));

	if (!xToken) {
		res.status(401).json(
			authJsonResponse(false, {
				message: "You don't have a valid access token, access denied.",
			})
		);
		return;
	}

	jwt.verify(xToken, PUB_KEY, async (err, decodedJwt) => {
		if (err) {
			console.log(err);
			res.status(401).json(
				authJsonResponse(false, {
					message: `${err.name}: ${err.message}`,
				})
			);
		} else {
			const client = (await getClient()) as PoolClient;

			try {
				const sql = `DELETE FROM ${Tables.auth_users} WHERE id = $1`;
				const values = [(decodedJwt as DecodedJwt).sub];

				await client.query(sql, values);

				res.status(200).json(
					authJsonResponse(true, {
						message: "The user has been deleted completely along with all its data",
					})
				);
			} catch (e) {
				console.log(e);

				res.status(500).json(
					authJsonResponse(false, {
						message: "Something went wrong while trying to delete the user",
					})
				);
			} finally {
				releaseClient(client);
			}
		}
	});
};
