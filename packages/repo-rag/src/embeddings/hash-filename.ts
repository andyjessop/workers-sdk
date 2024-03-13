/**
 * Converts any string to a hex hash of length 40
 */
export async function hashFilename(str: string) {
	const msgUint8 = new TextEncoder().encode(str); // encode as (utf-8) Uint8Array
	const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8); // hash the message
	const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
	const hashHex = hashArray
		.map((b) => b.toString(16).padStart(2, "0"))
		.join(""); // convert bytes to hex string
	return hashHex;
}
