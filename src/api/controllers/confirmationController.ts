import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import {Tables} from "../types/enums";
import {DecodedJwt} from "../types/types";
import {authJsonResponse, releaseClient} from "../utils/utils";
import {config} from "dotenv";
import getClient from "../../db/db";
import {PoolClient} from "pg";

config({
	path: "../../.env",
});

export const confirmationController = (req: Request, res: Response, next: NextFunction) => {
	jwt.verify(req.params.token, process.env.PUB_KEY as string, async (err, decodedJwt) => {
		if (err) {
			console.log(err);
			res.status(500).json(
				authJsonResponse(false, {
					message: "Something went wrong while verifying the email",
				})
			);
		} else {
			if (decodedJwt) {
				const client = (await getClient()) as PoolClient;

				try {
					const sql = `UPDATE ${Tables.auth_users} SET "isVerified" = $1 WHERE id = $2`;
					const values = [true, (decodedJwt as DecodedJwt).sub];

					const {rowCount} = await client.query(sql, values);

					rowCount
						? res.status(200).send(
								`
                            <h1>Thank you for verifying your account. You may now <a href="${process.env.FRONTEND_URL}/login">log in</a>!</h1>
                        `
						  )
						: res
								.status(404)
								.send(
									"<h1>Something went wrong when trying to find the user, please contact support to resolve the issue.</h1>"
								);
				} catch (e) {
					console.log(e);
					throw new Error("There was an error updating the isVerified field");
				} finally {
					releaseClient(client);
				}
			} else {
				res.status(500).json(
					authJsonResponse(false, {
						message: "Something went wrong while verifying the email",
					})
				);
			}
		}
	});
};
