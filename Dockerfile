# syntax=docker/dockerfile:1

# The Node version is the one pinned in .nvmrc, so that the container and a local
# install behave identically.
FROM node:24.22.1-alpine AS base
RUN corepack enable pnpm
WORKDIR /app

# Dependencies are installed in their own layer, so that editing a source file
# does not invalidate the install cache.
FROM base AS dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Development: the Vite dev server with hot module replacement. The sources are
# bind-mounted by Compose, so they are deliberately not copied here.
FROM dependencies AS development
EXPOSE 5173
CMD ["pnpm", "dev"]

# Linting, type checking and the test suite, runnable without a local Node setup.
FROM dependencies AS checks
COPY . .
CMD ["sh", "-c", "pnpm lint && pnpm typecheck && pnpm test"]

# Production build, then a static web server. nginx falls back to index.html so
# that any client-side route can be opened directly.
FROM dependencies AS build
COPY . .
RUN pnpm build

FROM nginx:1.29-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
