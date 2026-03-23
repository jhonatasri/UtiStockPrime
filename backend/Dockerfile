FROM node:24.14.0

# Instalação de dependências
RUN apt-get update && apt-get install -y libaio1 wget unzip libnss3 libatk1.0-0

WORKDIR /app

COPY *.json .

RUN yarn

# --- Labels custom (documentação de env) ---
LABEL app.required_env="SECRET,DATABASE_URL" \
  app.env.SECRET="Chave secreta da aplicação" \
  app.env.DATABASE_URL="String de conexão com banco"

COPY . .

RUN DATABASE_URL=dummy npx prisma generate

COPY ./public /app/dist/public

RUN yarn build

EXPOSE 3333

CMD [ "yarn", "start" ]

