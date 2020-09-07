import express from "express";
import apiRouter from "./api/routes/api";
import "dotenv/config";
import cors from "cors";
import errorhandler from "errorhandler";
import morgan from "morgan";

const app = express();
const PORT = process.env.PORT || 7000;

app.use(express.json());
app.use(
	cors({
		origin: process.env.FRONTEND_URL,
		credentials: true,
		exposedHeaders: ["x-token"],
	})
);
app.use(morgan("dev"));

app.use("/api", apiRouter);

if (process.env.NODE_ENV === "development") {
	app.use(errorhandler());
}

app.listen(PORT, () => console.log(`Server now listening at port: ${PORT}`));
