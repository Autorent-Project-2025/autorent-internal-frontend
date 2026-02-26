import { jwtDecode } from "jwt-decode";

interface TokenClaims {
  email?: string;
  Email?: string;
  sub?: string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"?: string;
}

export function extractEmailFromToken(token: string | null): string | null {
  if (!token) {
    return null;
  }

  try {
    const claims = jwtDecode<TokenClaims>(token);
    return (
      claims.email ??
      claims.Email ??
      claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ??
      null
    );
  } catch {
    return null;
  }
}
