import type { Context } from "hono";
import { getConnInfo } from "hono/bun";
import { UAParser } from "ua-parser-js";

export interface DeviceInfo {
	deviceName: string;
	ipAddress: string;
	userAgent: string;
}

export const getDeviceInfo = (c: Context): DeviceInfo => {
	const userAgent = c.req.header("user-agent") || "Unknown";
	const connInfo = getConnInfo(c);

	const parser = new UAParser(userAgent);
	const result = parser.getResult();

	return {
		deviceName: result.os.name ?? "Unknown",
		ipAddress: connInfo.remote.address ?? "Unknown",
		userAgent,
	};
};

