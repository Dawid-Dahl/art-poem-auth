import jwt from "jsonwebtoken";
import {JwtVerifyCallback, xTokenPayload} from "../types/types";

const jwtVerifyCallback: JwtVerifyCallback = (done, xRefreshToken, xToken) => {
	if (!xToken && !xRefreshToken) {
		done(
			new Error("No tokens included in request."),
			false,
			"You are unauthorized to access this resource."
		);
	}

	if (xToken && xRefreshToken) {
		jwt.verify(
			xToken,
			JSON.parse(process.env.PUB_KEY as string) as string,
			(err, decodedXToken) => {
				if (err) {
					jwt.verify(
						xRefreshToken,
						JSON.parse(process.env.PUB_KEY as string) as string,
						(err, decodedXRefreshToken) => {
							if (err) {
								done(
									err,
									false,
									"x-refresh-token has expired, is invalid, or is blacklisted. Log in to get a new one."
								);
							} else {
								if (decodedXRefreshToken) {
									done(
										null,
										decodedXRefreshToken as xTokenPayload,
										"x-refresh-token is valid, refreshing your x-token!",
										true
									);
								}
							}
						}
					);
				} else {
					decodedXToken &&
						done(null, decodedXToken as xTokenPayload, "x-token is valid!");
				}
			}
		);
	}

	if (xToken && !xRefreshToken) {
		jwt.verify(
			xToken,
			JSON.parse(process.env.PUB_KEY as string) as string,
			(err, decodedXToken) => {
				if (err) {
					done(err, false, "x-token has expired or is invalid. Log in to get a new one.");
				} else {
					decodedXToken &&
						done(null, decodedXToken as xTokenPayload, "x-token is valid!");
				}
			}
		);
	}

	if (!xToken && xRefreshToken) {
		jwt.verify(
			xRefreshToken,
			JSON.parse(process.env.PUB_KEY as string) as string,
			(err, decodedXRefreshToken) => {
				if (err) {
					done(
						err,
						false,
						"x-refresh-token has expired, is invalid, or is blacklisted. Log in to get a new one."
					);
				} else {
					if (decodedXRefreshToken) {
						done(
							null,
							decodedXRefreshToken as xTokenPayload,
							"x-refresh-token is valid, refreshing your x-token!",
							true
						);
					}
				}
			}
		);
	}
};

export default jwtVerifyCallback;
