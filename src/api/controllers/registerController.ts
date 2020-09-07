import path from "path";
import fs from "fs";
import {Request, Response} from "express";
import {validationResult} from "express-validator";
import {Tables} from "../types/enums";
import bcrypt from "bcrypt";
import {authJsonResponse, generateId, issueAccessToken, releaseClient} from "../utils/utils";
import fetch from "node-fetch";
import {sendEmail} from "../utils/nodemailer";
import {verificationEmail} from "../utils/mail-templates";
import getClient from "../../db/db";
import {PoolClient} from "pg";

export const registerController = async (req: Request, res: Response) => {
	const errors = validationResult(req);

	const id = generateId();
	const PRIV_KEY_PATH = path.join(__dirname, "../../", "cryptography", "id_rsa_priv.pem");
	const PRIV_KEY = fs.readFileSync(PRIV_KEY_PATH, "utf8");

	const xToken = await issueAccessToken(id, PRIV_KEY, "30d").catch(err => console.log(err));

	if (!xToken) throw new Error("Something went wrong while issueing the access token!");

	const sendVerificationEmail = sendEmail(verificationEmail().create(req.body.email, xToken));

	if (errors.isEmpty()) {
		bcrypt.hash(req.body.password, 10, async (err, hash) => {
			if (err) {
				console.error(err);
				return;
			}

			const client = (await getClient()) as PoolClient;

			try {
				//check that main API is available

				try {
					await fetch(`${process.env.MAIN_FETCH_URL}/api/ping`);
				} catch (e) {
					console.error("Could not connect to main API. No user created --", e);

					res.status(500).json(
						authJsonResponse(false, {
							message: "Registration is not possible right now. Sorry!",
						})
					);

					return;
				}

				//register user in auth db

				try {
					const sql = `INSERT INTO ${Tables.auth_users} (id, email, password) VALUES ($1, $2, $3)`;
					const values = [id, req.body.email, hash];

					await client.query(sql, values);
				} catch (e) {
					const errorMsg = e.message.includes(
						'duplicate key value violates unique constraint "auth_users_email_key"'
					)
						? "A user with that email is already registered."
						: "Couldn't register user.";

					res.status(403).json(authJsonResponse(false, {message: errorMsg}));

					return;
				}

				//register user in main db

				try {
					await fetch(`${process.env.MAIN_FETCH_URL}/api/users/create`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({id, username: req.body.username}),
					});

					await sendVerificationEmail();

					res.status(200).json(
						authJsonResponse(true, {
							message:
								"Almost done! Complete your registration by clicking the verification link in the email sent to your inbox! If you can't find it, check the Spam inbox.",
						})
					);
				} catch (e) {
					console.error("Could not connect to main API. No user created --", e);

					res.status(500).json(
						authJsonResponse(false, {
							message: "Registration is not possible right now. Sorry!",
						})
					);

					return;
				}
			} catch (e) {
				console.log(e);
			} finally {
				releaseClient(client);
			}
		});
	} else {
		res.status(422).send("Invalid Registration, try again!");
	}
};
