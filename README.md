# saby-router

**saby-router** provides modules and components that help you to implement a single-page application.

## Table of Contents

  * [Running the Tests](#running-the-tests)
  * [Running the Demo](#running-the-demo)
  * [Using Router.Route with Masks](#using-routerroute-with-masks)
    * [Mask Types](#mask-types)
  * [Using Router.Link](#using-routerlink)
  * [How-to](#how-to)

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

## Using Router.Route with Masks

`Router.Route` component has a `mask` option. Mask is a string that contains a special placeholder that starts with a colon (:) and represents an arbitrary parameter in the URL. The value of this parameter is extracted from the URL when it changes and is passed inside of the `Router.Route` with the same name as the placeholder itself.

**Example:**

    <Router.Route mask="destination/:myDestination">
       <p>Selected destination: {{ content.myDestination }}</p>
    </Router.Route>

If the URL has `destination/Italy`, the user will see `Selected destination: Italy`. If the URL doesn't match the mask `destination/...` at all, `myDestination` will be undefined.

### Mask Types

`Router.Route` supports two mask types: standard param and query param.

Standard param mask looks like `paramName/:myParamValue` and can contain any number of placeholders, for example `tour/:priceMin/:priceMax`. It matches any URL that contains the
mask.

Query param mask looks like `paramName=:paramValue` and can contain exactly one placeholder. It matches and extracts the placeholder value from any URL that contains the specified query param, for example `/mypurchases?filtered=true&paramName=age&greaterthan=2` would match the mask, and the extracted value would be `age`.

## Using Router.Link

## How-to

This section contains a list of common tasks that **saby-router** helps to accomplish. Each task has a link to the demo code that can be a starting point of your solution. [Follow these steps](#running-the-demo) to run the demo.