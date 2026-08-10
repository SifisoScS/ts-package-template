# ts-package-template

A starting point for a TypeScript npm package where the quality gates are
**load-bearing** — each one has been observed failing, not just passing.

Extracted from [scheduler-deadline](https://github.com/SifisoScS/scheduler-deadline),
which is published with signed provenance.

## What you get

|                          |                                                                         |
| ------------------------ | ----------------------------------------------------------------------- |
| **Dual ESM + CJS**       | Separate builds, own type definitions each, correct `exports` map       |
| **Coverage thresholds**  | Enforced in CI — the build fails when coverage drops                    |
| **Type-checked tests**   | `tests/` compiles under its own project, not just `src/`                |
| **Type-aware linting**   | ESLint 9+ flat config with `recommendedTypeChecked`                     |
| **Tokenless publishing** | npm trusted publishing (OIDC) — no `NPM_TOKEN` anywhere                 |
| **Signed provenance**    | Every release cryptographically linked to the commit that built it      |
| **Hardened CI**          | Least-privilege permissions, SHA-pinned actions, dependency audit       |
| **Lockfile guard**       | Rejects a platform-pruned `package-lock.json` before it breaks everyone |
| **Zero runtime deps**    | Nothing ships to consumers but your own code                            |

CI runs 13 gates across Node 20, 22 and 24.

## Using it

Click **Use this template**, then:

### 1. Rename the package

In `package.json`, set `name`, `description`, `keywords`, `repository`, and
**remove `"private": true`** so it can be published.

Then retarget the lockfile's identity without touching its dependency tree:

```bash
node -e "
const fs=require('node:fs');
const l=JSON.parse(fs.readFileSync('package-lock.json','utf8'));
const p=require('./package.json');
l.name=l.packages[''].name=p.name;
l.version=l.packages[''].version=p.version;
fs.writeFileSync('package-lock.json', JSON.stringify(l,null,2)+'\n');
"
npm ci && npm run check-lockfile
```

> Do **not** run a bare `npm install` to do this. See
> [Changing dependencies](CONTRIBUTING.md#changing-dependencies-on-windows).

### 2. Replace the placeholder API

`src/index.ts` exports a `greet` function purely so the toolchain has something
real to compile and cover. Replace it, and replace the generic smoke-test
assertions in `.github/workflows/ci.yml` with ones about your actual API.

### 3. Verify everything still passes

```bash
npm run check-lockfile && npm run format:check && npm run lint \
  && npm run type-check && npm run test:coverage && npm run build
```

### 4. Set up publishing

The first publish **cannot** use OIDC — npm requires the package to exist before
you can attach a trusted publisher. So:

1. Publish `1.0.0` once using a granular access token stored as `NPM_TOKEN` on
   an `npm-publish` environment, with `npm publish --provenance` in
   `release.yml`.
2. On npmjs.com, configure Trusted Publisher → GitHub Actions, pinned to your
   repo, `release.yml`, and the `npm-publish` environment.
3. Drop `NODE_AUTH_TOKEN` and `--provenance` from `release.yml` — provenance is
   automatic under trusted publishing — then delete the secret and revoke the
   token.

`release.yml` here is already in its **post-step-3, tokenless** form.

## Releasing

```bash
npm version patch     # or minor / major
git push --follow-tags
```

The tag drives the release. The workflow re-runs every check, verifies the tag
matches `package.json`, and publishes. A mismatch fails rather than shipping
something untraceable.

## Layout

```
.github/workflows/ci.yml       13 gates, Node 20/22/24
.github/workflows/release.yml  tag-driven, OIDC, no secrets
.githooks/pre-commit           blocks a pruned lockfile
scripts/check-lockfile.js      platform coverage + dependency completeness
scripts/write-dist-markers.js  per-directory "type" markers for the dual build
tsconfig.json                  production build (strict, no Jest types)
tsconfig.test.json             adds tests/ and Jest types
tsconfig.build.{cjs,esm}.json  output targets
eslint.config.mjs              flat config, type-aware
```

## Why the odd bits exist

**`scripts/check-lockfile.js`** — `npm install` resolves optional dependencies
against your machine and rewrites the lockfile without the native bindings other
platforms need. Jest 30 pulls in such bindings, so a lockfile committed from
Windows breaks CI on Linux. This caught it; the first version of the check was
too narrow and missed transitive packages, so it now also verifies that every
dependency named in the lockfile resolves.

**`scripts/write-dist-markers.js`** — the root package is `"type": "commonjs"`,
so Node reads everything under `dist/` as CommonJS. A minimal `package.json` in
each output directory tells Node how to parse that subtree, which is what lets
one package ship both formats with plain `.js` extensions.

**No dependency caching in `release.yml`** — a stale or poisoned cache would
otherwise be baked into a signed artifact.

## License

MIT
