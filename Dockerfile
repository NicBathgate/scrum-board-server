# docker build . -t scrum-board-server
# docker run -p 8080:8080 scrum-board-server


#COPY package.json yarn.lock tsconfig.json ./
COPY package.json tsconfig.json index.ts api.ts types.ts .env ./
#RUN yarn install --quiet
RUN npm install --quiet

#COPY ./src ./src
#RUN yarn build
#
#COPY ./nginx-sites-available /app/nginx-sites-available
#
#COPY ["docker-entrypoint.sh", "/docker-entrypoint.sh"]
#RUN chmod +x /docker-entrypoint.sh

#rm -f /app/nginx-sites/*
COPY localhost.conf /app/nginx-sites/localhost.conf

#ENTRYPOINT [ "/docker-entrypoint.sh" ]
#CMD [ "yarn", "start" ]
EXPOSE 8080
CMD [ "npm", "start" ]