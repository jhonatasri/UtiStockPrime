FROM node:alpine

WORKDIR /app

COPY *.json .

RUN npm install

COPY . .

LABEL app.required_env="NEXT_PUBLIC_API_URL" \
  app.env.SECRET="Chave secreta da aplicação" 

RUN npm run build

EXPOSE 3000

CMD [ "npm","run", "start" ]