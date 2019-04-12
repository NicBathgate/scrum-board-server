# docker build . -t scrum-board-server
# docker run -p 8080:8080 scrum-board-server

FROM node:8-alpine

WORKDIR /usr/app

COPY package.json tsconfig.json index.ts ./
RUN npm install --quiet

#COPY ./src ./src

#COPY ./nginx-sites-available /app/nginx-sites-available

#COPY ["docker-entrypoint.sh", "/docker-entrypoint.sh"]
#RUN chmod +x /docker-entrypoint.sh

#ENTRYPOINT [ "/docker-entrypoint.sh" ]
EXPOSE 8080

CMD [ "npm", "start" ]
