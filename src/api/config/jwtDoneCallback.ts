import {
	attachUserToRequest,
	authJsonResponse,
	issueAccessToken,
	constructUserFromTokenPayload,
	constructUserWithoutPasswordFromSqlResult,
	checkIfXRefreshTokenExistsInDb,
	removeBearerFromTokenHeader,
	releaseClient,
} from "../utils/utils";
import {JwtDoneCallback, xTokenPayload, AuthUser} from "../types/types";
import {config} from "dotenv";
import {Tables} from "../types/enums";
import getClient from "../../db/db";
import {PoolClient} from "pg";

config({path: "../../.env"});

const jwtJwtDoneCallback: JwtDoneCallback = (req, res, next) => (err, user, info, refresh) => {
	if (err) {
		res.status(401).json(authJsonResponse(false, {message: info}));
		next(err);
		return;
	}

	if (!user) {
		res.status(401).json(authJsonResponse(false, {message: info}));
		return;
	}

	if (user && refresh) {
		checkIfXRefreshTokenExistsInDb(removeBearerFromTokenHeader(req.get("x-refresh-token")))
			.then(async isXRefreshTokenExistingInDb => {
				if (isXRefreshTokenExistingInDb) {
					const client = (await getClient()) as PoolClient;

					const sql = `SELECT * FROM ${Tables.auth_users} WHERE id = $1`;

					client.query<AuthUser>(sql, [user.sub], (err, qRes) => {
						if (err) {
							next(err);
						} else {
							if (!qRes.rowCount) {
								res.status(401).json(
									authJsonResponse(false, {
										message:
											"No user with this id could be found in the database.",
									})
								);

								releaseClient(client);
								return;
							}

							const user = constructUserWithoutPasswordFromSqlResult(qRes.rows[0]);

							issueAccessToken(user.id, process.env.PRIV_KEY as string)
								.then(xToken => {
									attachUserToRequest(req, user);

									res.set("x-token", xToken);

									releaseClient(client);

									next();
								})
								.catch(err => next(err));
						}
					});
				} else {
					res.status(403).json(
						authJsonResponse(false, {
							message: "Your x-refresh-token has been blacklisted, access denied.",
						})
					);
				}
			})
			.catch(err => console.error(err));
	}

	if (user && !refresh) {
		attachUserToRequest(req, constructUserFromTokenPayload(user as xTokenPayload));

		next();
	}
};

export default jwtJwtDoneCallback;
