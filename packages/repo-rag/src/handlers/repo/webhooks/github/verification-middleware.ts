import { Logger } from "../../../../logger/Logger";
import type { Context, Next } from "../../../../types";

export async function githubWebhookVerificationMiddleware(
	ctx: Context,
	next: Next
) {
	const secret = ctx.env.GITHUB_WEBHOOK_SECRET;
	const logger = ctx.get("Logger");

	if (!secret) {
		logger.error(
			"GITHUB_WEBHOOK_SECRET is not set in the environment variables."
		);

		return ctx.json({ message: "Internal Server Error" }, 500);
	}

	try {
		const isVerified = await verifySignature(ctx.req.raw, secret, logger);

		if (!isVerified) {
			return ctx.json({ message: "Unauthorized" }, 401);
		}

		await next();
	} catch (error) {
		console.error("Error processing GitHub webhook:", error);
		return ctx.json({ message: "Internal Server Error" }, 500);
	}
}

async function verifySignature(req: Request, secret: string, logger: Logger) {
	const header = req.headers.get("x-hub-signature-256");
	if (!header) {
		logger.warn("x-hub-signature-256 header is missing.");
		return false;
	}

	try {
		// Convert the secret to a CryptoKey
		const encoder = new TextEncoder();
		const keyData = encoder.encode(secret);
		const key = await crypto.subtle.importKey(
			"raw",
			keyData,
			{ name: "HMAC", hash: { name: "SHA-256" } },
			false,
			["verify"]
		);

		// Convert the request body to an ArrayBuffer
		const bodyText = await req.text();
		const bodyBuffer = encoder.encode(bodyText);

		// Extract the signature from the headers
		const signatureHex = header.split("=")[1];
		const matches = signatureHex.match(/[\da-f]{2}/gi);
		if (!matches) {
			logger.warn("Invalid signature format in x-hub-signature-256 header.");
			return false;
		}
		const signature = new Uint8Array(matches.map((byte) => parseInt(byte, 16)));

		// Verify the signature
		const isVerified = await crypto.subtle.verify(
			"HMAC",
			key,
			signature,
			bodyBuffer
		);

		if (isVerified) {
			logger.success("Signature is verified.");
		} else {
			logger.error("Signature failed verification.");
		}

		return isVerified;
	} catch (error) {
		logger.error("Error verifying signature:", error);

		return false;
	}
}
