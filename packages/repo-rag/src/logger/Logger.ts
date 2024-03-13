export interface Logger {
	success(message: string, ...args: any[]): void;
	info(message: string, ...args: any[]): void;
	warn(message: string, ...args: any[]): void;
	error(message: string, ...args: any[]): void;
}

function getTimestamp(): string {
	return new Date().toISOString();
}

export function success(message: string, ...args: any[]): void {
	console.log(`\x1b[32m[${getTimestamp()}] ✔ ${message}\x1b[0m`, ...args);
}

export function info(message: string, ...args: any[]): void {
	console.log(`\x1b[36m[${getTimestamp()}] ℹ ${message}\x1b[0m`, ...args);
}

export function warn(message: string, ...args: any[]): void {
	console.warn(`\x1b[33m[${getTimestamp()}] ⚠ ${message}\x1b[0m`, ...args);
}

export function error(message: string, ...args: any[]): void {
	console.error(`\x1b[31m[${getTimestamp()}] ✖ ${message}\x1b[0m`, ...args);
}
