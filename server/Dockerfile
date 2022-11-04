FROM node:8-alpine
COPY package.json tsconfig.json index.ts api.ts types.ts ./
RUN npm install --quiet

ENTRYPOINT [ "npm", "start" ]
