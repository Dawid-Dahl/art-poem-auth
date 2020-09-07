/* import path from "path";
import fs from "fs";
import {Request, Response, NextFunction} from "express";
import {refreshXToken, removeBearerFromTokenHeader} from "../utils/utils";
import jwt from "jsonwebtoken";

const PUB_KEY_PATH = path.join(__dirname, "..", "cryptography", "id_rsa_pub.pem");
const PUB_KEY = fs.readFileSync(PUB_KEY_PATH, "utf8");

export const authenticateWithJwtStrategy = (req: Request, res: Response, next: NextFunction) => {
	const accessTokenFromHeader = req.get("authorization");
	const refreshTokenFromHeader = req.get("x-refresh-token");

	if (!accessTokenFromHeader || accessTokenFromHeader === "null") {
		res.status(401).json({success: false, msg: "Access-Token couldn't be found in headers."});
		return;
	}

	if (!refreshTokenFromHeader || refreshTokenFromHeader === "null") {
		const xToken = removeBearerFromTokenHeader(accessTokenFromHeader);

		try {
			const decoded = jwt.verify(xToken, PUB_KEY);

			if (typeof decoded === "object") {
				res.status(200).json({
					success: true,
					msg: "Your x-token is valid!",
				});
				return;
			} else {
				res.status(401).json({
					success: false,
					msg: "Refresh-Token couldn't be found in headers. Login to get a new one!",
				});
				return;
			}
		} catch (error) {
			res.status(401).json({
				success: false,
				msg: "Refresh-Token couldn't be found in headers. Login to get a new one!",
			});
			return;
		}
	}

	const customRefreshXToken = refreshXToken(req, res, next);

	customRefreshXToken(accessTokenFromHeader, refreshTokenFromHeader!, PUB_KEY);
};
 */
