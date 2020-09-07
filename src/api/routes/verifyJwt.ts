import express, {Request} from "express";
import verifyWithJwtStrategy from "../config/myPassport";
import {authJsonResponse} from "../utils/utils";
import {AuthUser} from "../types/types";

const verifyJwtRouter = express.Router();

interface RequestWithUser extends Request {
	user?: AuthUser;
}

verifyJwtRouter.post("/", verifyWithJwtStrategy, (req: RequestWithUser, res) => {
	res.status(200).json(authJsonResponse(true, {message: "Access granted", user: req.user}));
});

export default verifyJwtRouter;
