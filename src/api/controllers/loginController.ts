import {Request, Response, NextFunction} from "express";
import bcrypt from "bcrypt";
import {Tables} from "../types/enums";
import {SQLRefreshToken, AuthUser} from "../types/types";
import {
	issueAccessToken,
	issueRefreshToken,
	addRefreshTokenToDatabase,
	extractPayloadFromBase64JWT,
	constructUserWithoutPasswordFromSqlResult,
	authJsonResponse,
	releaseClient,
} from "../utils/utils";
import getClient from "../../db/db";
import {PoolClient} from "pg";

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
	const client = (await getClient()) as PoolClient;

	try {
		const sql = `SELECT * FROM ${Tables.auth_users} WHERE email = $1`;

		const {rows, rowCount} = await client.query<AuthUser>(sql, [req.body.email]);

		if (!rowCount) {
			res.status(401).json(
				authJsonResponse(false, {message: "No user with this password exists."})
			);
			return;
		}

		if (rows[0].isVerified === false) {
			res.status(401).json(
				authJsonResponse(false, {
					message:
						"You need to verify your account before logging in! Simply click the verification link in email we sent you.",
				})
			);
			return;
		}

		const isMatch = await bcrypt.compare(req.body.password, rows[0].password!);

		if (isMatch) {
			const user = constructUserWithoutPasswordFromSqlResult(rows[0]);

			const xTokenPromise = issueAccessToken(user.id, process.env.PRIV_KEY as string);
			const xRefreshTokenPromise = issueRefreshToken(user, process.env.PRIV_KEY as string);

			Promise.all([xTokenPromise, xRefreshTokenPromise])
				.then(values => {
					const [xTokenFromPromise, xRefreshTokenFromPromise] = values;

					const refreshTokenPayload = extractPayloadFromBase64JWT(
						xRefreshTokenFromPromise
					);

					if (refreshTokenPayload) {
						const sqlRefreshToken: SQLRefreshToken = {
							sub: refreshTokenPayload.sub as string,
							iat: refreshTokenPayload.iat,
							xRefreshToken: xRefreshTokenFromPromise,
						};

						addRefreshTokenToDatabase(sqlRefreshToken);

						res.status(200).json(
							authJsonResponse(
								true,
								{
									message: "Tokens generated!",
									user: {id: refreshTokenPayload.sub.toString()},
								},
								xTokenFromPromise,
								xRefreshTokenFromPromise
							)
						);
					} else {
						throw new Error(
							"For some reason the x-refresh-token was undefined and therefore couldn't be added to the database."
						);
					}
				})
				.catch(err => next(err));
		} else {
			res.status(401).json(
				authJsonResponse(false, {
					message: "Couldn't log in. Did you type in the wrong password?",
				})
			);
		}
	} catch (e) {
		console.log(e);

		res.status(503).json(
			authJsonResponse(false, {message: "Service unavailable at the moment."})
		);
	} finally {
		releaseClient(client);
	}
};
