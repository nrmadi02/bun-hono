import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import prisma from "prisma";
import type { Prisma } from "prisma/generated/client";
import { Provider } from "prisma/generated/enums";
import type { AppRouteHandler } from "../../lib/types";
import { toUserResponseSchema } from "../../schemas/user/user-response.schema";
import type {
	GetSessionsRoutes,
	LoginRoutes,
	LogoutRoutes,
	RegisterRoutes,
} from "./auth.routes";
import { UAParser } from "ua-parser-js";
import { getConnInfo } from 'hono/bun'

function getDeviceInfo(c: Context) {
	const userAgent = c.req.header("user-agent") || "Unknown";
	const ipAddress = getConnInfo(c);

	const parser = new UAParser(userAgent);
	const result = parser.getResult();

	return { deviceName: result.os.name ?? "Unknown", ipAddress: ipAddress.remote.address ?? "Unknown", userAgent };
}


async function manageUserSessions(userId: string, maxSessions: number = 5) {
	await prisma.session.deleteMany({
		where: {
			userId,
			expireAt: {
				lt: new Date(),
			},
		},
	});

	const activeSessions = await prisma.session.findMany({
		where: {
			userId,
			expireAt: {
				gte: new Date(),
			},
		},
		orderBy: {
			createdAt: "asc",
		},
	});

	if (activeSessions.length >= maxSessions) {
		const sessionsToDelete = activeSessions.slice(
			0,
			activeSessions.length - maxSessions + 1,
		);
		await prisma.session.deleteMany({
			where: {
				id: {
					in: sessionsToDelete.map((s) => s.id),
				},
			},
		});
	}
}

export const loginHandler: AppRouteHandler<LoginRoutes> = async (c) => {
	try {
		const { email, password } = c.req.valid("json");
		const secret = process.env.JWT_SECRET ?? "";

		const user = await prisma.user.findUnique({
			where: {
				email,
			},
			include: {
				accounts: {
					where: {
						provider: Provider.EMAIL,
					},
					select: {
						id: true,
						password: true,
					},
				},
			},
		});

		if (!user) {
			return c.json(
				{
					message: "User not found",
					success: false,
					errors: ["User not found"],
				},
				404,
			);
		}

		const isPasswordValid = await Bun.password.verify(
			password,
			user.accounts[0].password ?? "",
		);

		if (!isPasswordValid) {
			return c.json(
				{
					message: "Invalid password",
					success: false,
					errors: ["Invalid password"],
				},
				400,
			);
		}

		const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2); // 2 days
		const refreshExpires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
		const payload = {
			id: user.id,
			email: user.email,
			role: user.role,
			expires: expires.toISOString(),
		};

		const token = await sign(payload, secret, "HS256");
		const refreshToken = await sign(
			{ ...payload, expires: refreshExpires.toISOString() },
			secret,
			"HS256",
		);

		await manageUserSessions(user.id, 5);
		const { deviceName, ipAddress, userAgent } = getDeviceInfo(c);

		await prisma.session.create({
			data: {
				sessionToken: token,
				expireAt: expires,
				userId: user.id,
				deviceName,
				ipAddress,
				userAgent,
			},
		});

		return c.json(
			{
				message: "Login successful",
				success: true,
				data: {
					token,
					refreshToken,
					user: toUserResponseSchema(user),
				},
			},
			200,
		);
	} catch (error) {
		if (error instanceof HTTPException) {
			throw error;
		}
		throw new HTTPException(500, {
			message: "Internal server error",
		});
	}
};

export const registerHandler: AppRouteHandler<RegisterRoutes> = async (c) => {
	try {
		const { email, password, fullName, username } = c.req.valid("json");
		const secret = process.env.JWT_SECRET ?? "";

		const existingUser = await prisma.user.findFirst({
			where: {
				OR: [
					{ email: email.toLowerCase() },
					{ username: username.toLowerCase() },
				],
			} as Prisma.UserWhereInput,
		});

		if (existingUser) {
			return c.json(
				{
					message: "User already exists",
					success: false,
					errors: ["User already exists"],
				},
				400,
			);
		}

		const hashedPassword = await Bun.password.hash(password);

		const user = await prisma.user.create({
			data: {
				email,
				fullName,
				username,
				accounts: {
					create: {
						provider: Provider.EMAIL,
						password: hashedPassword,
					},
				},
			},
			include: {
				accounts: {
					where: {
						provider: Provider.EMAIL,
					},
					select: {
						id: true,
					},
				},
			},
		});

		const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2); // 2 days
		const refreshExpires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
		const payload = {
			id: user.id,
			email: user.email,
			role: user.role,
			expires: expires.toISOString(),
		};

		const token = await sign(payload, secret, "HS256");
		const refreshToken = await sign(
			{ ...payload, expires: refreshExpires.toISOString() },
			secret,
			"HS256",
		);

		await manageUserSessions(user.id, 5);

		const { deviceName, ipAddress, userAgent } = getDeviceInfo(c);

		await prisma.session.create({
			data: {
				sessionToken: token,
				expireAt: expires,
				userId: user.id,
				deviceName,
				ipAddress,
				userAgent,
			},
		});

		return c.json(
			{
				message: "Register successful",
				success: true,
				data: {
					token,
					refreshToken,
					user: toUserResponseSchema(user),
				},
			},
			200,
		);
	} catch (error) {
		if (error instanceof HTTPException) {
			throw error;
		}
		throw new HTTPException(500, {
			message: "Internal server error",
		});
	}
};

export const logoutHandler: AppRouteHandler<LogoutRoutes> = async (c) => {
	try {
		const token = c.var.token;

		if (token) {
			const session = await prisma.session.findFirst({
				where: {
					sessionToken: token,
				},
			});

			if (!session) {
				return c.json(
					{
						message: "User is not logged in",
						success: false,
						errors: ["User is not logged in"],
					},
					401,
				);
			}

			await prisma.session.delete({
				where: {
					sessionToken: token,
				},
			});

			return c.json(
				{
					message: "Logged out from device successfully",
					success: true,
					data: {
						message: "Logged out from device successfully",
					},
				},
				200,
			);
		}

		const session = await prisma.session.findUnique({
			where: {
				sessionToken: token,
			},
		});

		if (session) {
			await prisma.session.delete({
				where: {
					sessionToken: token,
				},
			});
		}

		return c.json(
			{
				message: "Logged out successfully",
				success: true,
				data: {
					message: "Logged out successfully",
				},
			},
			200,
		);
	} catch (error) {
		if (error instanceof HTTPException) {
			throw error;
		}
		throw new HTTPException(500, {
			message: "Internal server error",
		});
	}
};

export const getSessionsHandler: AppRouteHandler<GetSessionsRoutes> = async (
	c,
) => {
	try {
		const userId = c.var.userId;
		const token = c.var.token;

		await prisma.session.deleteMany({
			where: {
				userId,
				expireAt: {
					lt: new Date(),
				},
			},
		});
		const sessions = await prisma.session.findMany({
			where: {
				userId,
				expireAt: {
					gte: new Date(),
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		const sessionsData = sessions.map((session) => ({
			id: session.id,
			deviceName: session.deviceName,
			ipAddress: session.ipAddress,
			userAgent: session.userAgent,
			createdAt: session.createdAt.toISOString(),
			expireAt: session.expireAt.toISOString(),
			isCurrent: session.sessionToken === token,
		}));

		return c.json(
			{
				message: "Sessions retrieved successfully",
				success: true,
				data: {
					sessions: sessionsData,
				},
			},
			200,
		);
	} catch (error) {
		if (error instanceof HTTPException) {
			throw error;
		}
		throw new HTTPException(500, {
			message: "Internal server error",
		});
	}
};
