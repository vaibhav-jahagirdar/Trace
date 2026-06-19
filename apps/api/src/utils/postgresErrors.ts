import { AppError } from "../middleware/errorHandler";


export function handlePgError(err: any): never {
  if (err.code === "23505") {
    if (err.constraint === "users_email_key")
      throw new AppError("Email already in use", 409, "EMAIL_TAKEN");
    if (err.constraint === "users_username_key")
      throw new AppError("Username already taken", 409, "USERNAME_TAKEN");
    if (err.constraint === "organizations_slug_key")
      throw new AppError("Slug already taken", 409, "SLUG_TAKEN");
  }
  throw err;
}