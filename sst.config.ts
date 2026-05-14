// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path=".sst/platform/config.d.ts" />

/**
 * SST v3 (Ion) — Infrastructure-as-Code for NPO Template deployments.
 *
 * This file provisions the standard AWS infrastructure for a CTC project:
 *
 *  Component                              SST resource
 *  ──────────────────────────────────────────────────────────────────
 *  React/Vite frontend (S3 + CloudFront)  sst.aws.StaticSite
 *  Express API (ECS Fargate)              sst.aws.Service
 *  S3 bucket for media / image uploads    sst.aws.Bucket
 *  App secrets                            sst.Secret
 *
 * Database note:
 *  This template assumes an externally hosted PostgreSQL database (e.g. Neon).
 *  No RDS resource is provisioned — the connection string is injected at
 *  runtime via the DatabaseUrl secret.  Swap this out if your project uses a
 *  different database.
 *
 * ── Quick-start ──────────────────────────────────────────────────────────────
 *  1. Rename the app (change `name: 'my-app'` below to your project slug).
 *  2. Add / remove secrets to match your project's .env.example files.
 *  3. npx sst@ion install          # scaffold the .sst/ directory
 *  4. Set all secrets (see section below).
 *  5. npx sst@ion deploy --stage production
 *  6. After deploy: copy the "site" output URL, set CorsAllowedOrigins,
 *     then re-deploy (see CORS note below).
 *
 * ── Setting secrets ───────────────────────────────────────────────────────────
 *  npx sst@ion secret set <Name> "<value>" --stage production
 *
 *  Required secrets
 *  ──────────────────────────────────────────────────────────────────────────
 *  FirebaseApiKey              VITE_FIREBASE_APIKEY
 *  FirebaseAuthDomain          VITE_FIREBASE_AUTHDOMAIN (e.g. my-app.firebaseapp.com)
 *  FirebaseProjectId           VITE_FIREBASE_PROJECTID
 *  FirebaseStorageBucket       VITE_FIREBASE_STORAGEBUCKET
 *  FirebaseMessagingSenderId   VITE_FIREBASE_MESSAGINGSENDERID
 *  FirebaseAppId               VITE_FIREBASE_APPID
 *  FirebaseAdminSdkJson        Full contents of firebase-adminsdk.json (as a JSON string)
 *  DatabaseUrl                 PostgreSQL connection string
 *                                (postgres://user:pass@host/db?sslmode=require)
 *  EmailUser                   SMTP email address (nodemailer)
 *  EmailPass                   SMTP password (nodemailer)
 *  CorsAllowedOrigins          Leave unset on first deploy (defaults to "*"); set to
 *                                your CloudFront site URL before going live.
 *  ApiPublicDomain             Hostname for the API load balancer (e.g. api.example.com).
 *                                Required for HTTPS.
 *  ApiTlsCertificateArn        Optional. ACM certificate ARN (same region as the app).
 *                                Set this when DNS is NOT in Route 53:
 *                                  1. Request the cert in ACM.
 *                                  2. Add the validation CNAMEs at your DNS host.
 *                                  3. Set this secret and deploy with dns: false.
 *                                  4. After deploy, add a CNAME: ApiPublicDomain → ALB DNS name.
 *
 * ── CORS note ─────────────────────────────────────────────────────────────────
 *  The API needs the frontend's CloudFront URL for CORS, but the CloudFront URL
 *  is only known after the first deploy — a soft circular dependency.
 *  Recommended flow:
 *    1. First deploy — CorsAllowedOrigins defaults to "*" until you set a real origin.
 *    2. After deploy, copy the "site" output URL (CloudFront domain).
 *    3. npx sst@ion secret set CorsAllowedOrigins "<cloudfront-url>" --stage production
 *    4. Re-deploy to lock down CORS.
 *
 * ── Firebase auth proxy note ──────────────────────────────────────────────────
 *  vercel.json proxies /__/auth/* to Firebase for signInWithRedirect support.
 *  CloudFront does NOT support this natively.  Options:
 *    a) Switch to signInWithPopup (simplest — no proxy needed).
 *    b) Add a CloudFront Function to proxy /__/auth/* requests.
 *  See client/docs/signInWithRedirect.md for context.
 */

export default $config({
  app(input) {
    return {
      // ── TODO: rename this to your project slug (lowercase, hyphens OK) ──────
      name: 'my-app',

      // Protect production resources from accidental deletion.
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: ['production'].includes(input?.stage),
      home: 'aws',
      providers: {
        aws: {
          // us-west-1 = N. California.  Change to your preferred region.
          region: 'us-west-1',
        },
      },
    };
  },

  async run() {
    // ── Secrets ──────────────────────────────────────────────────────────────
    // Define secrets here so SST tracks them.  Set actual values with:
    //   npx sst@ion secret set <Name> "<value>" --stage <stage>

    // Firebase client-side credentials (injected into the Vite build at deploy time)
    const firebaseApiKey = new sst.Secret('FirebaseApiKey');
    const firebaseAuthDomain = new sst.Secret('FirebaseAuthDomain');
    const firebaseProjectId = new sst.Secret('FirebaseProjectId');
    const firebaseStorageBucket = new sst.Secret('FirebaseStorageBucket');
    const firebaseMessagingSenderId = new sst.Secret('FirebaseMessagingSenderId');
    const firebaseAppId = new sst.Secret('FirebaseAppId');

    // Firebase Admin SDK — full contents of firebase-adminsdk.json as a JSON string.
    // See server/config/firebase.ts for how this is consumed at runtime.
    const firebaseAdminSdkJson = new sst.Secret('FirebaseAdminSdkJson');

    // Database connection string (e.g. Neon, Supabase, or self-hosted Postgres).
    // Used by server/db/db-pgp.ts as PROD_DATABASE_URL.
    const databaseUrl = new sst.Secret('DatabaseUrl');

    // Email / nodemailer credentials (server/common/transporter.ts)
    const emailUser = new sst.Secret('EmailUser');
    const emailPass = new sst.Secret('EmailPass');

    // CORS — defaults to "*" for first deploy; update after you have the CloudFront URL.
    const corsAllowedOrigins = new sst.Secret('CorsAllowedOrigins', '*');

    // Public hostname for the ECS load balancer (ALB).  Required for HTTPS.
    // Without this, SST exposes the ALB over HTTP only, which browsers block
    // when your frontend is served over HTTPS from CloudFront.
    const apiPublicDomain = new sst.Secret('ApiPublicDomain');

    // Pre-validated ACM cert ARN.  Set when your DNS is NOT in Route 53.
    const apiTlsCertificateArn = new sst.Secret('ApiTlsCertificateArn', '');

    // ── Media / uploads S3 bucket ─────────────────────────────────────────────
    // Stores user-uploaded images.  Separate from the frontend bucket that
    // sst.aws.StaticSite creates automatically.
    const mediaBucket = new sst.aws.Bucket('MediaBucket');

    // ── VPC + ECS cluster ─────────────────────────────────────────────────────
    const vpc = new sst.aws.Vpc('Vpc');
    const cluster = new sst.aws.Cluster('Cluster', { vpc });

    // ── Backend Express API (ECS Fargate) ─────────────────────────────────────
    // Built from server/Dockerfile with the repo root as the Docker context.
    const api = new sst.aws.Service('Api', {
      cluster,
      image: {
        context: '.',
        dockerfile: 'server/Dockerfile',
      },
      loadBalancer: $util
        .all([apiPublicDomain.value, apiTlsCertificateArn.value])
        .apply(([domain, certArn]) => {
          const name = domain.trim();
          const arn = certArn.trim();
          const rules = [
            { listen: '80/http', redirect: '443/https' } as const,
            { listen: '443/https', forward: '3001/http' } as const,
          ];
          // dns: false avoids a Route 53 HostedZoneLookup when your domain
          // is not managed in this AWS account.
          if (arn) {
            return {
              domain: { name, dns: false as const, cert: arn },
              rules,
            };
          }
          return { domain: name, rules };
        }),

      environment: {
        NODE_ENV: 'production',
        PROD_SERVER_PORT: '3001',

        // Database
        PROD_DATABASE_URL: databaseUrl.value,

        // Media S3 bucket
        PROD_S3_BUCKET_NAME: mediaBucket.name,
        PROD_S3_REGION: 'us-west-1',

        // Firebase Admin SDK
        FIREBASE_ADMIN_SDK_JSON: firebaseAdminSdkJson.value,

        // Email
        EMAIL_USER: emailUser.value,
        EMAIL_PASS: emailPass.value,

        // CORS
        CORS_ALLOWED_ORIGINS: corsAllowedOrigins.value,
      },

      link: [mediaBucket],
    });

    // ── React / Vite Frontend (S3 + CloudFront) ───────────────────────────────
    // SST creates a private S3 bucket and CloudFront distribution, runs
    // `yarn build` inside client/, injects all VITE_* env vars at build time,
    // syncs the output to S3, and invalidates the CloudFront cache on each deploy.
    //
    // errorPage routes all CloudFront 404s to index.html for SPA client-side routing.
    const site = new sst.aws.StaticSite('Client', {
      path: 'client',
      build: {
        command: 'yarn build',
        output: 'dist',
      },
      environment: {
        // API URL — automatically set to the Fargate service's load balancer URL
        VITE_BACKEND_HOSTNAME: api.url,

        // Firebase client-side config
        VITE_FIREBASE_APIKEY: firebaseApiKey.value,
        VITE_FIREBASE_AUTHDOMAIN: firebaseAuthDomain.value,
        VITE_FIREBASE_PROJECTID: firebaseProjectId.value,
        VITE_FIREBASE_STORAGEBUCKET: firebaseStorageBucket.value,
        VITE_FIREBASE_MESSAGINGSENDERID: firebaseMessagingSenderId.value,
        VITE_FIREBASE_APPID: firebaseAppId.value,

        // Required for the /__/auth/* Firebase auth proxy — see note at top of file.
        FIREBASE_AUTH_PROXY_HOST: firebaseAuthDomain.value,
      },

      errorPage: 'index.html',
    });

    // ── Outputs ───────────────────────────────────────────────────────────────
    // Printed by `sst deploy` on completion.
    return {
      api: api.url,
      site: site.url,
    };
  },
});
