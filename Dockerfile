FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

RUN mkdir -p logs

RUN addgroup -g 1001 -S xcars
RUN adduser -S xcars -u 1001

RUN chown -R xcars:xcars /app
USER xcars

EXPOSE 5000

CMD ["npm", "start"]