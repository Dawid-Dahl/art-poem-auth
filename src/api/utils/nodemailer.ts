import nodemailer from "nodemailer";
import {config} from "dotenv";
import Mail from "nodemailer/lib/mailer";

config({
	path: "../../.env",
});

export const sendEmail = (template: Mail.Options) => async () => {
	try {
		const transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 465,
			secure: true,
			auth: {
				type: "OAuth2",
				user: process.env.EMAIL_TRANSPORT_USER,
				clientId: process.env.EMAIL_TRANSPORT_CLIENT_ID,
				clientSecret: process.env.EMAIL_TRANSPORT_CLIENT_SECRET,
				refreshToken: process.env.EMAIL_TRANSPORT_REFRESH_TOKEN,
				accessToken: process.env.EMAIL_TRANSPORT_ACCESS_TOKEN,
				expires: 3599,
			},
		});

		const info = await transporter.sendMail(template);

		console.log("Email sent: ", info.messageId);
	} catch (e) {
		console.log("Something went wrong while sending the email!");
		console.error(e);
	}
};
