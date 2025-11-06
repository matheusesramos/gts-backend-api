FROM node:22-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm install
RUN npx prisma generate

# Copiar código
COPY . .

# Railway injeta $PORT dinamicamente
EXPOSE 8080

# Comando de inicialização
CMD ["npm", "start"]