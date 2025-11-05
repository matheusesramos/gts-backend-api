FROM node:22-alpine

# Dependências do sistema para Prisma
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm install
RUN npx prisma generate

# Copiar código
COPY . .

# Criar pasta public
RUN mkdir -p public

# Porta
ENV PORT=3001
EXPOSE 3001

# Comando de inicialização
CMD ["npm", "start"]