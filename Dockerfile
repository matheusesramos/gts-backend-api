FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm install
RUN npx prisma generate

# Copiar código
COPY . .

# Porta do App Platform
ENV PORT=8080
EXPOSE 8080

# Comando de inicialização
CMD ["npm", "start"]