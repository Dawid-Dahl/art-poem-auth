import express from "express";
import {forgotMyPasswordController} from "../controllers/forgotMyPasswordController";
import {resetPasswordController} from "../controllers/resetPasswordController";
import {check} from "express-validator";

const forgotMyPasswordRouter = express.Router();

forgotMyPasswordRouter.post("/", forgotMyPasswordController);
forgotMyPasswordRouter.post(
	"/reset",
	[check("password").isLength({min: 4}).withMessage("Password must be at least 4 chars long")],
	resetPasswordController
);

export default forgotMyPasswordRouter;
