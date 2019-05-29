# docker build . -t scrum-board-server
# docker run -p 8080:8080 scrum-board-server

FROM node:8-alpine
#COPY package.json yarn.lock tsconfig.json ./
COPY package.json tsconfig.json index.ts api.ts types.ts ./
#RUN yarn install --quiet
RUN npm install --quiet

#COPY ["docker-entrypoint.sh", "/docker-entrypoint.sh"]
#RUN chmod +x /docker-entrypoint.sh
#ENTRYPOINT [ "/docker-entrypoint.sh" ]

EXPOSE 8080
CMD [ "npm", "start" ]