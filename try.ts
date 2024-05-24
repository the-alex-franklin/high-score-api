// deno-fmt-ignore-file
export type Success<T> = { success: true; failure: false; data: T; };
export type Failure = { success: false; failure: true; error: Error };

function Success<T>(data: T): Success<T> {
	return { success: true, failure: false, data };
}

function Failure(error: unknown): Failure {
	if (error instanceof Error) return { success: false, failure: true, error };
	return { success: false, failure: true, error: new Error(JSON.stringify(error)) };
}

export function Try<T>(fn: () => T): Extract<T, Promise<any>> extends never ? Failure | Success<T> : Promise<Failure | Success<Awaited<T>>>;
export function Try<T>(fn: () => T): Failure | Success<T> | Promise<Failure | Success<T>> {
	try {
		const result = fn();
		if (result instanceof Promise) return result.then(Success, Failure)

		return Success(result);
	} catch (error: unknown) {
		return Failure(error);
	}
}
