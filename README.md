# Spesame

[![Deploy](https://github.com/amedeo-pasanisi/spesame/actions/workflows/deploy.yml/badge.svg)](https://github.com/amedeo-pasanisi/spesame/actions/workflows/deploy.yml)

Shared grocery lists. Invite other users and choose whether they can view or edit. Built with React, Vite, TypeScript and Firebase (Auth, Firestore, Hosting).

## Installation

Requires Node 22.

```bash
npm install
```

Create a `.env` file in the project root with the Firebase web config (Firebase Console → Project settings → Your apps). Never commit it.

```
VITE_FIREBASE_APIKEY=
VITE_FIREBASE_AUTHDOMAIN=
VITE_FIREBASE_PROJECTID=
VITE_FIREBASE_STORAGEBUCKET=
VITE_FIREBASE_MESSAGINGSENDERID=
VITE_FIREBASE_APPID=
```

## Usage

```bash
npm run dev     # dev server
npm test        # unit tests
npm run lint
```

## Deployment

**Every push to `main` deploys to production.** [`deploy.yml`](.github/workflows/deploy.yml) runs lint → test → build → Firebase Hosting deploy. If a step fails, nothing is deployed.

The workflow needs these GitHub Actions secrets:

- the six `VITE_FIREBASE_*` values (same as `.env`)
- `FIREBASE_SERVICE_ACCOUNT_SPESAME_71D4D` (created by `npx firebase init hosting:github`)

A new `VITE_*` variable must be added to `.env`, to the secrets **and** to the `Build` step of the workflow.

**Rollback:** Firebase Console → Hosting → release history → Rollback.

## Contributing

Pre-commit hooks run `tsc` and ESLint. Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/). Run `npm run commit` for a guided prompt.

## License

[Unlicense](LICENSE) (public domain).
