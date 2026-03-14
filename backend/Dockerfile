FROM node:20.11.0

# Instalação de dependências
RUN apt-get update && apt-get install -y libaio1 wget unzip libnss3 libatk1.0-0

WORKDIR /app

COPY *.json .

RUN yarn

COPY . .

COPY ./public /app/dist/public

# RUN yarn build

EXPOSE 3333

CMD [ "yarn", "start" ]

