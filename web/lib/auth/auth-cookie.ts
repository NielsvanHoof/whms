/**
 * Laravel session cookie name. Must match API `config/session.php` (`{app-slug}-session`).
 * Default aligns with APP_NAME=Laravel → `laravel-session`.
 */
export const AUTH_SESSION_COOKIE_NAME =
	process.env.NEXT_PUBLIC_API_SESSION_COOKIE_NAME ?? "laravel-session";
