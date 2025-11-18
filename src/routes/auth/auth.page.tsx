/** @jsxImportSource hono/jsx */
import { renderToString } from "hono/jsx/dom/server";
import { verify } from "hono/jwt";
import prisma from "prisma";
import { createRouter } from "../../lib/create-app";
import { env } from "../../config/env";
import { VerifyEmailView } from "../../views/auth/verify-email.view";

const router = createRouter().get("/auth/verify-email", async (c) => {
	try {
		const token = c.req.query("token");

		if (!token) {
			return c.html(
				renderToString(
					<VerifyEmailView
						success={false}
						message="Token tidak ditemukan. Silakan periksa link verifikasi email Anda."
					/>,
				),
			);
		}

		const secret = env.JWT_SECRET;

		try {
			const payload = await verify(token, secret, "HS256");
			const userId = payload.id as string;

			if (!userId) {
				return c.html(
					renderToString(
						<VerifyEmailView
							success={false}
							message="Token tidak valid. Silakan minta email verifikasi baru."
						/>,
					),
				);
			}

			const user = await prisma.user.findUnique({
				where: { id: userId },
			});

			if (!user) {
				return c.html(
					renderToString(
						<VerifyEmailView
							success={false}
							message="User tidak ditemukan."
						/>,
					),
				);
			}

			if (user.emailVerified) {
				return c.html(
					renderToString(
						<VerifyEmailView
							success={true}
							message="Email Anda sudah terverifikasi sebelumnya."
						/>,
					),
				);
			}

			await prisma.user.update({
				where: { id: userId },
				data: { emailVerified: true },
			});

			return c.html(
				renderToString(
					<VerifyEmailView
						success={true}
						message="Email berhasil diverifikasi! Anda sekarang dapat menggunakan semua fitur aplikasi."
					/>,
				),
			);
		} catch {
			return c.html(
				renderToString(
					<VerifyEmailView
						success={false}
						message="Token tidak valid atau sudah kedaluwarsa. Silakan minta email verifikasi baru."
					/>,
				),
			);
		}
	} catch {
		return c.html(
			renderToString(
				<VerifyEmailView
					success={false}
					message="Terjadi kesalahan saat memverifikasi email. Silakan coba lagi nanti."
				/>,
			),
		);
	}
});

export default router;
