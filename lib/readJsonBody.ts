import { NextResponse } from 'next/server';

// Caps request body size on the API surface, mirroring rawsec's Nginx
// `client_max_body_size 2m`. None of these endpoints legitimately receive
// large payloads, so an oversized body is treated as abuse and rejected with
// 413 before we attempt to parse it.
export const MAX_BODY_BYTES = 2 * 1024 * 1024; // 2 MB

type Parsed<T> =
  | { data: T; error: null }
  | { data: null; error: NextResponse };

/**
 * Reads and JSON-parses a request body with a hard size limit.
 * Returns `{ error }` (a ready-to-return NextResponse) instead of throwing,
 * so callers can `if (error) return error;`.
 */
export async function readJsonBody<T = unknown>(
  req: Request,
  maxBytes: number = MAX_BODY_BYTES
): Promise<Parsed<T>> {
  const declared = req.headers.get('content-length');
  if (declared && Number(declared) > maxBytes) {
    return {
      data: null,
      error: NextResponse.json({ error: 'Payload too large' }, { status: 413 }),
    };
  }

  const text = await req.text();
  // Byte length, not char count — multi-byte chars must count fully.
  if (new TextEncoder().encode(text).length > maxBytes) {
    return {
      data: null,
      error: NextResponse.json({ error: 'Payload too large' }, { status: 413 }),
    };
  }

  try {
    return { data: JSON.parse(text) as T, error: null };
  } catch {
    return {
      data: null,
      error: NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }),
    };
  }
}
