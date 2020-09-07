/*
import {Request, Response, NextFunction} from "express";
import {refreshXToken, removeBearerFromTokenHeader} from "../utils/utils";
import jwt from "jsonwebtoken";

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
			const decoded = jwt.verify(xToken, process.env.PUB_KEY as string);

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

	customRefreshXToken(accessTokenFromHeader, refreshTokenFromHeader!, process.env.PUB_KEY as string);
};
 */
