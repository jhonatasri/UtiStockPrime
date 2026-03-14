#!/bin/bash

# Para interromper o script se algum comando falhar
set -e

# Nome da imagem local criada pelo docker compose
IMAGE_NAME=""

# Endereço do registry + nome da imagem destino
REGISTRY="162.215.216.20:5000"
REMOTE_IMAGE="$REGISTRY/api_stock_prime"

echo ">> Gerando o build"
yarn build

echo ">> Construindo imagem com docker compose..."
docker compose build

echo ">> Tagueando imagem ($IMAGE_NAME -> $REMOTE_IMAGE)..."
docker tag $IMAGE_NAME $REMOTE_IMAGE

echo ">> Enviando imagem para o registry ($REMOTE_IMAGE)..."
docker push $REMOTE_IMAGE

echo ">> Deploy finalizado com sucesso!"
