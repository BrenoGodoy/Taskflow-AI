# ====== Stage 1: build ======
FROM node:20-alpine AS builder

# OpenSSL necessário para o Prisma detectar a versão correta no Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Instala dependências (inclui devDependencies para build)
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Gera o Prisma Client, compila a aplicação e o seed
RUN npx prisma generate
RUN rm -rf dist tsconfig.tsbuildinfo && npm run build && test -f dist/main.js
RUN npm run build:seed

# ====== Stage 2: runtime ======
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production

# Apenas dependências de produção
COPY package*.json ./
RUN npm install --omit=dev

# Prisma Client + CLI (migrate/seed em runtime)
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts

RUN chmod +x scripts/start-prod.sh

EXPOSE 3000

CMD ["sh", "scripts/start-prod.sh"]
