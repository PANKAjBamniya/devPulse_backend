import crypto from "crypto";

export const generateCodeVerifier = () =>
    crypto.randomBytes(32).toString("hex");

export const generateCodeChallenge = (verifier) =>
    crypto
        .createHash("sha256")
        .update(verifier)
        .digest("base64url");
