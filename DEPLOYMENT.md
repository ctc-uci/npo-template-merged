# Deployment Guide

This guide walks through deploying the NPO Template to AWS using [SST v3 (Ion)](https://ion.sst.dev). SST provisions and manages all infrastructure automatically — S3, CloudFront, ECS Fargate, and an ALB — so you don't have to configure any of it manually.

---

## Overview

| Layer | Technology | How it's deployed |
|---|---|---|
| Frontend | React + Vite | S3 + CloudFront via `sst.aws.StaticSite` |
| Backend | Express (Node 20) | ECS Fargate via `sst.aws.Service` |
| Media uploads | S3 | `sst.aws.Bucket` |
| Database | PostgreSQL (Neon or similar) | External — connection string injected at deploy |
| Auth | Firebase | Credentials injected as SST Secrets |

---

## Prerequisites

Before you begin, make sure you have the following:

- **Node.js 20+** — check with `node -v`
- **Yarn 1.x** — check with `yarn -v`
- **AWS account** with an IAM user that has permissions to manage CloudFormation, S3, CloudFront, ECR, ECS, IAM, and EC2 (VPC/security groups)
- **AWS CLI configured** — run `aws configure` with your IAM credentials
- **Docker** — required for the ECS Fargate build (SST builds and pushes the image automatically)
- A **Firebase project** with a web app and Admin SDK service account
- A **PostgreSQL database** connection string (e.g. from [Neon](https://neon.tech))

---

## Step 1 — Rename the app

Open `sst.config.ts` and change the `name` field to your project's slug. This name is used as a prefix for all AWS resources, so it should be lowercase with hyphens only.

```ts
// sst.config.ts
app(input) {
  return {
    name: 'your-project-name', // ← change this
    ...
  };
}
```

> **Important:** Once you deploy, avoid changing this name. Renaming it will cause SST to treat the existing stack as a new one and attempt to create duplicate resources.

---

## Step 2 — Update the Firebase Admin SDK setup

The template's `server/config/firebase.ts` imports the Admin SDK credentials from a local JSON file. For production, this needs to read from the `FIREBASE_ADMIN_SDK_JSON` environment variable that SST injects at runtime.

Replace the contents of `server/config/firebase.ts` with:

```ts
import firebaseAdmin, { type ServiceAccount } from 'firebase-admin';

const serviceAccount = JSON.parse(
  process.env.FIREBASE_ADMIN_SDK_JSON ?? '{}'
) as ServiceAccount;

export const admin = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});
```

This works for both local development (where you can set `FIREBASE_ADMIN_SDK_JSON` in `server/.env`) and production (where SST injects it automatically).

---

## Step 3 — Install SST

Run the following from the repo root to scaffold the `.sst/` platform directory:

```bash
npx sst@ion install
```

This downloads the SST runtime and sets up the local tooling. The `.sst/` directory is already in `.gitignore` and should never be committed.

---

## Step 4 — Set secrets

SST manages all application secrets separately from the codebase. Set each one using the CLI before your first deploy:

```bash
npx sst@ion secret set <Name> "<value>" --stage production
```

### Required secrets

| Secret name | Description |
|---|---|
| `FirebaseApiKey` | `VITE_FIREBASE_APIKEY` from your Firebase web app config |
| `FirebaseAuthDomain` | `VITE_FIREBASE_AUTHDOMAIN` (e.g. `your-app.firebaseapp.com`) |
| `FirebaseProjectId` | `VITE_FIREBASE_PROJECTID` |
| `FirebaseStorageBucket` | `VITE_FIREBASE_STORAGEBUCKET` |
| `FirebaseMessagingSenderId` | `VITE_FIREBASE_MESSAGINGSENDERID` |
| `FirebaseAppId` | `VITE_FIREBASE_APPID` |
| `FirebaseAdminSdkJson` | Full contents of `firebase-adminsdk.json` as a single JSON string |
| `DatabaseUrl` | PostgreSQL connection string (e.g. `postgres://user:pass@host/db?sslmode=require`) |
| `EmailUser` | SMTP email address used by nodemailer |
| `EmailPass` | SMTP password |
| `ApiPublicDomain` | The hostname you want for your API (e.g. `api.your-domain.com`) |

### Optional secrets

| Secret name | Default | Description |
|---|---|---|
| `CorsAllowedOrigins` | `*` | Your CloudFront site URL. Leave as `*` for the first deploy — see [Step 6](#step-6--lock-down-cors). |
| `ApiTlsCertificateArn` | _(empty)_ | ACM certificate ARN. Only required if your domain is **not** managed in Route 53 — see [Custom domains](#custom-domains). |

**Example — setting the Firebase Admin SDK JSON:**

```bash
npx sst@ion secret set FirebaseAdminSdkJson "$(cat server/config/firebase-adminsdk.json)" --stage production
```

---

## Step 5 — Deploy

Run the following from the repo root:

```bash
npx sst deploy --stage production
```

SST will:
1. Build the Docker image for the Express server and push it to ECR
2. Build the Vite frontend, injecting all `VITE_*` env vars
3. Upload the frontend to S3 and invalidate the CloudFront cache
4. Provision any new infrastructure declared in `sst.config.ts`

When the deploy finishes, SST prints the output URLs:

```
✓  Complete
   api:  https://your-alb-domain.us-west-1.elb.amazonaws.com
   site: https://xxxxxxxxxx.cloudfront.net
```

Save the `site` URL — you'll need it in the next step.

---

## Step 6 — Lock down CORS

On first deploy, `CorsAllowedOrigins` defaults to `*`. Before going live, replace it with your actual CloudFront URL:

```bash
npx sst@ion secret set CorsAllowedOrigins "https://xxxxxxxxxx.cloudfront.net" --stage production
npx sst deploy --stage production
```

This second deploy is quick — only the ECS task definition is updated.

---

## Custom domains

If your domain is **not** managed in AWS Route 53 (e.g. it's at Cloudflare, Namecheap, or a campus registrar), follow these steps to set up HTTPS on the API.

**1. Request a certificate in ACM**

In the AWS Console, go to **Certificate Manager → Request a certificate**. Enter your API hostname (e.g. `api.your-domain.com`) and choose DNS validation.

**2. Validate the certificate**

ACM will show you a CNAME record to add at your DNS provider. Add it and wait for the status to show **Issued** (usually a few minutes).

**3. Set the certificate ARN secret**

Copy the ARN from ACM and set it:

```bash
npx sst@ion secret set ApiTlsCertificateArn "arn:aws:acm:us-west-1:123456789:certificate/..." --stage production
```

**4. Deploy**

```bash
npx sst deploy --stage production
```

**5. Add the CNAME at your DNS provider**

After the deploy, SST will print the ALB DNS name. Add a CNAME record at your DNS provider:

```
api.your-domain.com  →  your-alb-domain.us-west-1.elb.amazonaws.com
```

---

## CI/CD with GitHub Actions

The repo includes `.github/workflows/sst-deploy.yml`, which automatically runs `sst deploy` on every push to `main`.

**Setup — add two repository secrets** under **Settings → Secrets and variables → Actions**:

| Secret | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user access key ID |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret access key |

The IAM user needs permissions to manage: CloudFormation, S3, CloudFront, ECR, ECS, IAM, EC2.

All application secrets (Firebase keys, database URL, etc.) are stored in SST and pulled automatically at deploy time — they do **not** need to be added to GitHub.

**Manual deploys**

You can also trigger a deploy manually from the **Actions** tab with a custom stage name (e.g. `staging`):

```
workflow_dispatch → stage: staging
```

---

## Adding project-specific secrets

If your project needs additional secrets beyond the defaults (e.g. a third-party API key), add them in three places:

**1. Declare the secret in `sst.config.ts`:**

```ts
const myApiKey = new sst.Secret('MyApiKey');
```

**2. Pass it to the service's environment:**

```ts
environment: {
  MY_API_KEY: myApiKey.value,
  // ...existing vars
}
```

**3. Add the type to `sst-env.d.ts`:**

```ts
MyApiKey: {
  type: 'sst.sst.Secret';
  value: string;
};
```

Then set the value:

```bash
npx sst@ion secret set MyApiKey "<value>" --stage production
```

---

## Useful commands

| Command | Description |
|---|---|
| `npx sst@ion install` | Scaffold the `.sst/` directory (run once after cloning) |
| `npx sst deploy --stage production` | Deploy to production |
| `npx sst@ion secret set <Name> "<value>" --stage production` | Set a secret |
| `npx sst@ion secret list --stage production` | List all secrets for a stage |
| `npx sst@ion remove --stage production` | Tear down all resources for a stage |
| `npx sst dev` | Start a local dev server linked to live AWS resources |

> **Note on `sst remove`:** Resources in the `production` stage are set to `removal: 'retain'` in `sst.config.ts`, which means SST will skip deletion of S3 buckets and the ECS service rather than destroy them. This is intentional — it protects against accidental data loss.
