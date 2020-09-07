import express from "express";
import {confirmationController} from "../controllers/confirmationController";

const confirmationRouter = express.Router();

confirmationRouter.get("/:token", confirmationController);

export default confirmationRouter;
