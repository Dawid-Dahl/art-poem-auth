import {Request, Response, NextFunction} from "express";
import {removeBearerFromTokenHeader, authJsonResponse} from "../utils/utils";
import jwtVerifyCallback from "./jwtVerifyCallback";
import {JwtDoneCallback, MyPassport, JwtVerifyCallback} from "../types/types";
import jwtDoneCallback from "./jwtDoneCallback";

const myPassport: MyPassport = (verify: JwtVerifyCallback, done: JwtDoneCallback, options = {}) => (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const xToken = removeBearerFromTokenHeader(req.get("x-token"));
	const xRefreshToken = removeBearerFromTokenHeader(req.get("x-refresh-token"));

	if (xRefreshToken?.toLowerCase() === "null") {
		res.status(401).json(
			authJsonResponse(false, {
				message: "You are unauthorized to view this resource. Log in to gain access.",
			})
		);
		return;
	}

	if (!xToken && !xRefreshToken) {
		res.status(401).json(
			authJsonResponse(false, {
				message: "You are unauthorized to view this resource. Log in to gain access.",
			})
		);
		return;
	}

	if (xToken && xRefreshToken) {
		verify(done(req, res, next), xRefreshToken, xToken);
		return;
	}

	if (xToken && !xRefreshToken) {
		verify(done(req, res, next), false, xToken);
		return;
	}

	if (!xToken && xRefreshToken) {
		verify(done(req, res, next), xRefreshToken);
		return;
	}

	return;
};

const verifyWithJwtStrategy = myPassport(jwtVerifyCallback, jwtDoneCallback);

export default verifyWithJwtStrategy;
