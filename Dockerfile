FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
# Install ALL dependencies (including devDependencies like Vite) to build the frontend
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production
# Re-install ONLY production dependencies for the final small image
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
EXPOSE 3001
CMD ["node", "server/app.js"]
