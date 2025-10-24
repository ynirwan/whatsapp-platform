# Base Node image
FROM node:18-alpine


# Set working directory
WORKDIR /app

# Copy only package setup first
COPY package*.json ./
COPY vite.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Install dependencies as root
RUN npm cache clean --force && \
    npm install


# Initialize Tailwind
#RUN npx tailwindcss init -p

# Create directory structure
RUN mkdir -p src/{api,components/{common,layout,messages,contacts,templates,analytics},pages,store,hooks,utils,styles}

# Copy everything else
COPY . .

# Expose dev server port
EXPOSE 5173

# Default command to start Vite
CMD ["npm", "run", "dev", "--", "--host"]

