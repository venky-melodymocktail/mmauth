# Use Node.js version 20
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on



EXPOSE 8089

# Command to start the application
CMD ["yarn", "start"]
