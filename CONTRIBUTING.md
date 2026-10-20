# Contributing to Strum Player

Thanks for your interest! Strum Player is an open personal project: the code is public and
contributions are welcome, but every change is **reviewed and approved by the maintainer** before
it is merged.

## Before writing code

- **Bugs**: open an issue with the "Bug report" form.
- **Ideas and new features**: open a "Feature request" issue first and wait for feedback. This
  avoids work that may not be accepted.
- **Security**: follow [SECURITY.md](SECURITY.md); do not open public issues.

## Workflow

1. **Fork** the repository and create a branch from `main`: `feat/<name>` for features,
   `fix/<name>` for fixes.
2. Install and run it: `npm install`, then `npx expo start` (see the [README](README.md)).
3. Make your changes in small, descriptive commits following
   [Conventional Commits](https://www.conventionalcommits.org) (`feat:`, `fix:`, `docs:`…).
4. Before opening the pull request, make sure these pass:
   ```bash
   npm run lint
   npm run typecheck
   npm test
   ```
5. Open a **pull request against `main`** and fill in the template. CI runs once the maintainer
   approves it; you may be asked for changes before the merge.

## Guidelines

- Follow the existing code style; Prettier and ESLint also run on commit.
- The app must work on iOS, Android and web.
- Expo changes often: check the docs for the SDK in use (58) before relying on an API.

## License of contributions

By submitting a pull request you agree that your contribution is released under the project
license, [GPL-3.0-only](LICENSE).

## Conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
