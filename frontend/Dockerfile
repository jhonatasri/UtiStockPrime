FROM node:alpine 

WORKDIR /app 

COPY *.json . 

RUN npm install 

COPY . . 

RUN npm run build 

EXPOSE 3000 

CMD [ "npm","run", "start" ]