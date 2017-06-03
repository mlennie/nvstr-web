FROM node

RUN apt-get update
RUN apt-get -qq update
RUN npm install http-server -g

COPY . .

EXPOSE 4400
CMD ["http-server", "-p", "4400"]

# build image command
# docker build -t desiredName .

# run container command
# docker run -d --rm -p 4400 --name desiredName imageName


