
# ===== DOCKERFILE =====
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le code source
COPY . .

# Exposer le port
EXPOSE 5173

# Variables d'environnement pour Vite
ENV CHOKIDAR_USEPOLLING=true
ENV CHOKIDAR_INTERVAL=1000

# Démarrer l'application en mode développement avec host binding
CMD ["npm", "run", "dev"]
