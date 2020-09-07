import express from "express";
import {deleteUserController} from "../controllers/deleteUserController";

const deleteUserRouter = express.Router();

deleteUserRouter.delete("/account-data", deleteUserController);

export default deleteUserRouter;
