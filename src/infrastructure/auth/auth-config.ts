interface AuthInfrastructureConfig {
  /** Auth0 tenant domain, e.g. `your-tenant.auth0.com` */
  domain: string;
  /** API identifier configured in Auth0 */
  audience: string;
}

export type { AuthInfrastructureConfig };
