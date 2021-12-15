FROM node:16.3-alpine

WORKDIR /home/rest-template-node-BG/

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

EXPOSE 4000

CMD [ "npm", "start" ]
