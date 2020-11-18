#Use an exiting docker image as a base
FROM node:alpine

WORKDIR /app/ticket

# Install a dependency
COPY package.json .
RUN npm install --only=prod
RUN npm audit fix

COPY . .

#Tell the image what to do when it starts as a container
CMD ["npm", "run", "dev"]