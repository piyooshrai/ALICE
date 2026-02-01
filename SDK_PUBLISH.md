# How to Publish ALICE SDK to NPM

## Prerequisites

You need an NPM account with access to publish under `@the-algorithm` organization.

## Steps to Publish

### 1. Login to NPM (if not already logged in)

```bash
npm login
# Enter your NPM username, password, and email
```

### 2. Publish the SDK

```bash
cd alice-sdk
npm publish --access public
```

### 3. Verify Publication

```bash
npm view @the-algorithm/alice
```

## After Publishing

Developers can install with:

```bash
npm install -g @the-algorithm/alice
```

Then use:

```bash
alice init
alice analyze
```

## Troubleshooting

**Error: "You do not have permission to publish"**
- You need to be added to the `@the-algorithm` NPM organization
- Or change package name in `package.json` to your username: `@yourusername/alice`

**Error: "Package already exists"**
- Increment version in `package.json` (e.g., "1.0.0" → "1.0.1")
- Then run `npm publish` again

## Current Package Details

- Name: `@the-algorithm/alice`
- Version: `1.0.0`
- Main: `src/cli.js`
- Binary: `alice` command
