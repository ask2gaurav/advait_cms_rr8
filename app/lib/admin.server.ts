import { z } from "zod";
import { data } from "react-router";

export type FormErrors = {
  formError?: string;
  fieldErrors?: Record<string, string>;
};

/** Throw from a save function to report a friendly, field-scoped error. */
export class FieldError extends Error {
  field: string;
  constructor(field: string, message: string) {
    super(message);
    this.field = field;
  }
}

function zodToFieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/**
 * Run a create/update. Returns `null` on success (caller should redirect), or a
 * 400 `data()` response describing validation / uniqueness errors.
 */
export async function saveOrError(fn: () => Promise<void>) {
  try {
    await fn();
    return null;
  } catch (err) {
    if (err instanceof FieldError) {
      return data<FormErrors>(
        err.field === "_"
          ? { formError: err.message }
          : { fieldErrors: { [err.field]: err.message } },
        { status: 400 },
      );
    }
    if (err instanceof z.ZodError) {
      return data<FormErrors>(
        { fieldErrors: zodToFieldErrors(err) },
        { status: 400 },
      );
    }
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code: number }).code === 11000
    ) {
      return data<FormErrors>(
        { fieldErrors: { slug: "That slug is already in use." } },
        { status: 400 },
      );
    }
    throw err;
  }
}

/** Parse + validate a JSON-encoded form field (e.g. section / row arrays). */
export function parseJsonField<T>(
  form: FormData,
  name: string,
  schema: z.ZodType<T>,
): T {
  let parsed: unknown;
  try {
    parsed = JSON.parse(String(form.get(name) ?? "[]"));
  } catch {
    throw new FieldError(name, "Must be valid JSON.");
  }
  const result = schema.safeParse(parsed);
  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue?.path.length ? `${issue.path.join(".")}: ` : "";
    throw new FieldError(name, `${path}${issue?.message ?? "Invalid data."}`);
  }
  return result.data;
}

/**
 * Which editor a stored `body` belongs to. Trusts an explicit `bodyFormat`,
 * else infers from shape (BlockNote = array, Lexical = `{ root }` object).
 */
export function inferBodyFormat(
  body: unknown,
  stored?: string,
): "blocknote" | "lexical" {
  if (stored === "lexical" || stored === "blocknote") return stored;
  if (body && !Array.isArray(body) && typeof body === "object") return "lexical";
  return "blocknote";
}

/** Set publishedAt the first time something is published; keep it thereafter. */
export function resolvePublishedAt(
  status: string,
  current: Date | undefined | null,
): Date | undefined {
  if (status === "published" && !current) return new Date();
  return current ?? undefined;
}
