#!/bin/bash
echo "Preparando o ambiente para o Risking..."
yarn install
cd backend && yarn install && yarn build
cd ../frontend && yarn install
echo "Subindo o banco de dados via Docker..."
docker compose up -d db
echo "Aguardando o Postgres..."
sleep 5
echo "Setup completo!"
