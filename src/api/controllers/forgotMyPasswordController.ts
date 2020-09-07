import path from "path";
import fs from "fs";
import {Request, Response} from "express";
import {Tables} from "../types/enums";
import {AuthUser} from "../types/types";
import {authJsonResponse, issueAccessToken, releaseClient} from "../utils/utils";
import {sendEmail} from "../utils/nodemailer";
import {resetPasswordEmail} from "../utils/mail-templates";
import getClient from "../../db/db";
import {PoolClient} from "pg";

export const forgotMyPasswordController = async (req: Request, res: Response) => {
	const PRIV_KEY_PATH = path.join(__dirname, "../../", "cryptography", "id_rsa_priv.pem");
	const PRIV_KEY = fs.readFileSync(PRIV_KEY_PATH, "utf8");

	const client = (await getClient()) as PoolClient;

	try {
		const sql = `SELECT id from ${Tables.auth_users} WHERE email = $1`;
		const values = [req.body.email];

		const {rows, rowCount} = await client.query<AuthUser>(sql, values);

		if (rowCount) {
			try {
				const xToken = await issueAccessToken(rows[0].id, PRIV_KEY, "1h");

				if (!xToken)
					throw new Error("Something went wrong while issueing the access token!");

				const sendResetPasswordEmail = sendEmail(
					resetPasswordEmail().create(req.body.email, xToken)
				);

				sendResetPasswordEmail();

				res.status(200).json(
					authJsonResponse(true, {
						message: "Check your email to reset your password! You have 1h to do this.",
					})
				);
			} catch (e) {
				console.log(e);
				res.status(500).json(
					authJsonResponse(false, {
						message:
							"Something went wrong server side, probably while issuing the resetToken!",
					})
				);
			}
		} else {
			res.status(404).json(
				authJsonResponse(false, {
					message: "No user associated with that email could be found!",
				})
			);
		}
	} catch (e) {
		console.log(e);
		throw new Error("There was an error getting the id");
	} finally {
		releaseClient(client);
	}
};
