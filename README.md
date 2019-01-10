# saby-router

**saby-router** provides modules and components that help you to implement a single-page application.

## Table of Contents

  * [Running the Tests](#running-the-tests)
  * [Running the Demo](#running-the-demo)

## Running the Tests

To start the unit testing server, run the following commands:

    npm install
    npm run build
    npm start

Go to http://localhost:1023 in your browser to execute the tests and see the results. The tests themselves are located in the `RouterTest` folder, filename of every test file ends with `.test.js`.

## Running the Demo

To start the demo server, run the following commands:

    npm install
    npm run build
    node app

Go to http://localhost:777/RouterDemo/ in your browser to see the demo page. The demo itself is located in `RouterDemo` folder, with an entry file of `index.html` that loads the module `RouterDemo/Main`.