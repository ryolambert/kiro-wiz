---
title: "Environment Configuration - Autonomous Agent - Docs - Kiro"
sourceUrl: "https://kiro.dev/docs/autonomous-agent/sandbox/environment-configuration/"
category: "autonomous-agent"
lastUpdated: "2026-02-07T05:52:37.212Z"
---
# Environment Configuration

---

You can configure the sandbox environment using a [Dockerfile](https://docs.docker.com/reference/dockerfile/). This defines your development environment configuration, including dependencies, build commands, and runtime requirements.

## Automatic configuration

Kiro autonomous agent looks for a `Dockerfile` in the root of your repository. If found, the agent automatically configures the sandbox based on these specifications, ensuring the environment matches your project's requirements.

Only publicly available container images are supported. Private registry images and private repositories cannot be accessed by the sandbox.

## Dockerfile configuration

You can use a standard [Dockerfile](https://docs.docker.com/reference/dockerfile/) to configure the sandbox environment. The agent will build and use the Docker image defined in your Dockerfile.

Example Dockerfile:

```dockerfile
FROM node:18

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "start"]

```