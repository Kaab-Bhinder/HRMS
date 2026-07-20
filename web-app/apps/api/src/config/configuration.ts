export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  // PaaS hosts (Render, Fly, Railway) inject the port as PORT and route to it;
  // API_PORT stays as the local override. PORT wins so a deploy never has to
  // guess which port the platform assigned.
  port: parseInt(process.env.PORT ?? process.env.API_PORT ?? '4000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173').split(',').map((s) => s.trim()),
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '7d',
  },
  cookie: {
    secret: process.env.COOKIE_SECRET!,
    refreshName: process.env.REFRESH_COOKIE_NAME ?? 'wms_rt',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '120', 10),
  },
});
