import {Request, Response, NextFunction} from "express";
import {ParamsDictionary} from "express-serve-static-core";
import {authJsonResponse, jsonResponse} from "../utils/utils";

export type AuthUser = {
	id: string;
	email?: string;
	password?: string;
	isVerified?: boolean;
	created_at?: string;
	updated_at?: string;
};

export type xTokenPayload = {
	sub: number;
	username: string;
	email: string;
	admin: number;
	iat: number;
	exp: number;
};

export type DecodedJwt = {
	sub: string;
	iat: number;
	exp: number;
};

export type SQLRefreshToken = {
	sub: string;
	iat: number;
	xRefreshToken: string | undefined;
};

export type JwtDoneCallback = (
	req: Request<ParamsDictionary>,
	res: Response<any>,
	next: NextFunction
) => (
	err: string | Error | null,
	user: xTokenPayload | false,
	info?: string,
	refresh?: boolean
) => void;

export type PartiallyAppliedJwtDoneCallback = (
	err: string | Error | null,
	user: xTokenPayload | false,
	info?: string,
	refresh?: boolean
) => void;

export type JwtVerifyCallback = (
	done: PartiallyAppliedJwtDoneCallback,
	xRefreshToken?: string | false,
	xToken?: string
) => void;

export type MyPassport = (
	verify: JwtVerifyCallback,
	done: JwtDoneCallback,
	options?: {}
) => (req: Request<ParamsDictionary>, res: Response<any>, next: NextFunction) => void;

export type AuthJsonResponse = ReturnType<typeof authJsonResponse>;

export type AuthJsonResponsePayload = {
	message?: string;
	user?: AuthUser;
};

export type JsonResponse = ReturnType<typeof jsonResponse>;
