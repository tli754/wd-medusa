import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  plugins: [
    {
      resolve: "@rx-ventures/medusa-plugin-shopify-sync",
      options: {
        encryption_key: process.env.SHOPIFY_SYNC_ENCRYPTION_KEY,
        // shopify_api_version: "2026-01"     // override Shopify Admin GraphQL version
        // webhook_base_url: process.env.MEDUSA_BACKEND_URL  // for webhook auto-registration
      },
    },
  ],
})
