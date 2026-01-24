// services/api/src/middleware/ltiHandshake.ts
export async function ltiOidcLogin(req: any, res: any) {
  // 1) Validate issuer/client_id/login_hint/target_link_uri
  // 2) Create state + nonce server-side
  // 3) Redirect to LMS OIDC auth endpoint
  res.status(501).send("LTI OIDC login not implemented in v1");
}

export async function ltiLaunch(req: any, res: any) {
  // 1) Verify id_token signature (JWKS)
  // 2) Validate nonce/state
  // 3) Map LMS context/course -> classId
  // 4) Create or link teacher account
  res.status(501).send("LTI launch not implemented in v1");
}
