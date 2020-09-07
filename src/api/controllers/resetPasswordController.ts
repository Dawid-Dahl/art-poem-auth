import {Request, Response} from "express";
import jwt from "jsonwebtoken";
import {Tables} from "../types/enums";
import {authJsonResponse, extractPayloadFromBase64JWT, releaseClient} from "../utils/utils";
import {config} from "dotenv";
import {validationResult} from "express-validator";
import bcrypt from "bcrypt";
import getClient from "../../db/db";
import {PoolClient} from "pg";

config({
	path: "../../.env",
});

export const resetPasswordController = (req: Request, res: Response) => {
	const errors = validationResult(req);

	const {password, resetToken}: {password: string; resetToken: string} = req.body;

	if (!resetToken) {
		res.status(401).json(
			authJsonResponse(false, {
				message: "You don't have a valid reset token, access denied.",
			})
		);
		return;
	}

	const resetTokenPayload = extractPayloadFromBase64JWT(resetToken);

	const userId = resetTokenPayload?.sub as string;

	if (!userId) {
		throw new Error("No user ID could be found in the resetToken");
	}

	if (errors.isEmpty()) {
		jwt.verify(resetToken, process.env.PUB_KEY as string, (err, decodedJwt) => {
			if (err) {
				console.log(err);
				res.status(401).json(
					authJsonResponse(false, {
						message: `${err.name}: ${err.message}`,
					})
				);
			} else {
				if (decodedJwt) {
					bcrypt.hash(password, 10, async (err, hash) => {
						if (err) {
							console.error(err);
							return;
						}

						const client = (await getClient()) as PoolClient;

						try {
							const sql = `UPDATE ${Tables.auth_users} SET password=$1 WHERE id=$2`;
							const values = [hash, userId];

							await client.query(sql, values);

							res.status(200).json(
								authJsonResponse(true, {
									message: `Your password has been changed! You may now login!`,
								})
							);
						} catch (e) {
							console.log(e);
							res.status(500).json(
								authJsonResponse(false, {
									message: "Something went wrong while updating the password!",
								})
							);
							return;
						} finally {
							releaseClient(client);
						}
					});
				} else {
					res.status(500).json(
						authJsonResponse(false, {
							message: "Something went wrong while verifying the email",
						})
					);
				}
			}
		});
	} else {
		res.status(422).send("Invalid Registration, try again!");
	}
};
