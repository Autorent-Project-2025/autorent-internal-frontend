import { jwtDecode } from "jwt-decode";
export function extractEmailFromToken(token) {
    if (!token) {
        return null;
    }
    try {
        const claims = jwtDecode(token);
        return (claims.email ??
            claims.Email ??
            claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ??
            null);
    }
    catch {
        return null;
    }
}
