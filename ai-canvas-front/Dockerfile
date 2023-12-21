# pull official base image
FROM node:16.17-alpine3.15 as build

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
# RUN apk update
# RUN apk add --update node
RUN npm install -g npm
RUN npm ci
RUN npm install react-scripts@3.4.1 -g 
COPY . ./
RUN npm run build

# add app



FROM node:16.17-alpine3.15
WORKDIR /app
COPY --from=build /app/build /app/
RUN npm install -g serve
# start app
EXPOSE 8080
# RUN serve -s ./build/ -p 8080
CMD ["serve", "-s", "/app", "-p", "8080" ]
