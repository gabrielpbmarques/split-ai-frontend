FROM node:22-slim as builder

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json ./

RUN npm install

# Copy all project files instead of just selective ones
# This ensures all config files like tailwind.config.js and postcss.config.js are included
COPY . .

# Build the application
RUN npm run build

# Production stage - using standalone output
FROM node:22-slim as runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary files from the build
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create an empty public directory to avoid the COPY error
# Next.js expects this directory to exist even if empty
RUN mkdir -p ./public

EXPOSE 3000

ENV PORT 3000
# Set the hostname to listen on all interfaces
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
