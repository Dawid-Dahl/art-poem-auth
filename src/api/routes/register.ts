import express from "express";
import {check} from "express-validator";
import {registerController} from "../controllers/registerController";

const registerRouter = express.Router();

registerRouter.get("/", (req, res) => {
	res.send("This is the registration!");
});

registerRouter.post(
	"/",
	[
		check("username")
			.isLength({min: 4})
			.withMessage("Username must be at least 4 chars long"),
		check("email").isEmail(),
		check("password")
			.isLength({min: 4})
			.withMessage("Password must be at least 4 chars long")
	],
	registerController
);

export default registerRouter;
