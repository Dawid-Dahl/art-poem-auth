import {
	SQLRefreshToken,
	xTokenPayload,
	AuthUser,
	AuthJsonResponsePayload,
	DecodedJwt,
} from "../types/types";
import jwt from "jsonwebtoken";
import {config} from "dotenv";
import {Tables} from "../types/enums";
import {Request} from "express";
import {PoolClient, QueryResult} from "pg";
import getClient from "../../db/db";

interface RequestWithUser extends Request {
	user?: object;
}

config({
	path: "../../.env",
});

export const log = (label: string, expression = "") => {
	console.log(label + " --- ");
	console.log(expression);
	return expression;
};

export const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

export const authJsonResponse = (
	success: boolean,
	payload?: AuthJsonResponsePayload,
	xToken?: string,
	xRefreshToken?: string
) =>
	!payload && !xToken && !xRefreshToken
		? {success}
		: !xToken && !xRefreshToken
		? {success, payload}
		: !xRefreshToken
		? {success, payload, xToken}
		: {success, payload, xToken, xRefreshToken};

export const jsonResponse = (
	success: boolean,
	payload?: string | NodeJS.ReadableStream | undefined
) => (!payload ? {success} : {success, payload});

export const removeBearerFromTokenHeader = (tokenHeader: string | undefined) =>
	tokenHeader?.split(" ")[1];

export const extractPayloadFromBase64JWT = (
	jwt: string | undefined
): xTokenPayload | DecodedJwt | undefined =>
	!jwt
		? undefined
		: [jwt]
				.map(x => x.split(".")[1])
				.map(x => Buffer.from(x, "base64"))
				.map(x => x.toString("utf8"))
				.map(x => JSON.parse(x))[0];

export const issueAccessToken = (userId: AuthUser["id"], privKey: string, expiresIn = "1m") => {
	const payload = {
		sub: userId,
	};

	console.log("THE PRIV KEY: ", privKey);

	const signedXTokenPromise = new Promise<string>((res, rej) => {
		jwt.sign(payload, privKey, {expiresIn, algorithm: "RS256"}, (err, xToken) =>
			err ? rej(err) : res(xToken)
		);
	});

	return signedXTokenPromise;
};

export const issueRefreshToken = (user: AuthUser, privKey: string, expiresIn = "30d") => {
	const payload = {
		sub: user.id,
	};

	const signedXRefreshTokenPromise = new Promise<string>((res, rej) => {
		jwt.sign(payload, privKey, {expiresIn, algorithm: "RS256"}, (err, xRefreshToken) =>
			err ? rej(err) : res(xRefreshToken)
		);
	});

	return signedXRefreshTokenPromise;
};

export const addRefreshTokenToDatabase = async (refreshToken: SQLRefreshToken) => {
	const client = (await getClient()) as PoolClient;

	try {
		const sql = `INSERT INTO ${Tables.refresh_tokens} (sub, iat, refresh_token) VALUES ($1, $2, $3)`;
		const values = [refreshToken.sub, refreshToken.iat, refreshToken.xRefreshToken];

		console.log("VALUES: ", values);

		await client.query(sql, values);

		console.log("Refresh Token added to database!");
	} catch (e) {
		console.log(e);
	} finally {
		releaseClient(client);
	}
};

export const constructUserWithoutPasswordFromSqlResult = (payload: AuthUser): AuthUser => ({
	id: payload.id,
	email: payload.email,
});

export const constructUserFromTokenPayload = (payload: xTokenPayload): AuthUser => ({
	id: payload.sub.toString(),
});

export const attachUserToRequest = (req: RequestWithUser, user: AuthUser) => {
	req.user = {
		id: user.id,
	};
};

export const checkIfXRefreshTokenExistsInDb = async (
	xRefreshToken: string | undefined
): Promise<boolean> => {
	const client = (await getClient()) as PoolClient;

	try {
		if (xRefreshToken) {
			const sql = `SELECT * FROM ${Tables.refresh_tokens} WHERE refresh_token = $1`;

			return new Promise(async (res, rej) => {
				const {rows, rowCount} = await client.query(sql, [xRefreshToken]);

				rowCount ? res(Boolean(rows[0])) : rej(null);
			});
		} else {
			throw new Error("Token was undefined and not a string.");
		}
	} catch (e) {
		console.log(e);
		return Promise.resolve(false);
	} finally {
		releaseClient(client);
	}
};

export const refreshAndFetch = (
	url: string,
	{method, headers, body}: RequestInit
): Promise<Response> => {
	return fetch(url, {
		method: method,
		headers,
		body,
	});
};

export const logQ = <T>(qRes: QueryResult<T>): void => {
	console.log("Executed query", {
		rows: qRes?.rowCount ?? 0,
		queryResult: qRes.rows,
	});
};

export const logQuery = (rows: any[], rowCount: number): void => {
	console.log("Executed query", {
		queryResult: rows,
		rowCount,
	});
};

export const releaseClient = (client: PoolClient) => (
	console.log("Client was released back into the pool"), client.release()
);
