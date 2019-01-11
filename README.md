# saby-router

**saby-router** provides modules and components that help you to implement a single-page application.

## Table of Contents

  * [Enabling the Single Page Routing](#enabling-the-single-page-routing)
  * [Running the Tests](#running-the-tests)
  * [Running the Demo](#running-the-demo)
  * [Using Router.Route to Match URLs](#using-routerroute-to-match-urls)
    * [Mask Types](#mask-types)
  * [Using Router.Link to Change URLs](#using-routerlink-to-change-urls)
    * [Specifying a Pretty URL](#specifying-a-pretty-url)
    * [Clearing a Part of the URL](#clearing-a-part-of-the-url)
  * [How-to](#how-to)

## Running the Tests

To start the unit testing server, run the following commands:

    npm install
    npm run build
    npm start

Go to [http://localhost:1023](http://localhost:1023) in your browser to execute the tests and see the results. The tests themselves are located in the `RouterTest` folder, filename of every test file ends with `.test.js`.

## Running the Demo

To start the demo server, run the following commands:

    npm install
    npm run build
    node app

Go to [http://localhost:777/RouterDemo/](http://localhost:777/RouterDemo/) in your browser to see the demo page. The demo itself is located in `RouterDemo` folder, with an entry file of `index.html` that loads the module `RouterDemo/Main`.

## Enabling the Single Page Routing

For **saby-router** components and modules to work, the page has to have a `Router.Controller` component in it. All components nested inside of it will have access to single page routing.

If your page is built from a `.html.tmpl`, or your application is rendered inside of a `Controls/Application/Route` template, it already has the controller in it, so you don't have to include it manually.

## Using Router.Route to Match URLs

`Router.Route` is a component that lets you match URLs and extract values from them.

This component has a `mask` option. Mask is a string that contains a special placeholder that starts with a colon (:) and represents an arbitrary parameter in the URL. The value of this parameter is extracted from the URL when it changes and is passed inside of the `Router.Route` with the same name as the placeholder itself.

**Example:**

    <Router.Route mask="destination/:myDestination">
       <p>Selected destination: {{ content.myDestination }}</p>
    </Router.Route>

If the URL contains the substring `destination/Italy`, the user will see `Selected destination: Italy`. If the URL doesn't match the mask `destination/*` at all, `myDestination` will be undefined.

### Mask Types

`Router.Route` supports two mask types: standard param and query param.

#### Standard Param Mask

Standard param mask looks like `paramName/:paramValue` and can contain any number of placeholders, for example `tour/:priceMin/:priceMax`. It matches any URL that contains the
mask.

Placeholder value for standard param mask ends when the URL ends, or when `#`, `/` or `?` character is encountered.

**Example:**

    Mask: "paramName/:paramValue"

    URL: "/paramName/valueOne"        -> paramValue = "valueOne"
    URL: "/paramName/value/Two"       -> paramValue = "value"
    URL: "/paramName/value?num=three" -> paramValue = "value"
    URL: "/paramName/value#Four"      -> paramValue = "value"

#### Query Param Mask

Query param mask looks like `paramName=:paramValue` and can contain exactly one placeholder. It matches and extracts the placeholder value from any URL that contains the specified query param, for example `/mypurchases?filtered=true&paramName=age&greaterthan=2` would match the mask, and the extracted value would be `age`.

Placeholder value for query param mask ends when the URL ends, or when `#` or `&` character is encountered.

**Example:**

    Mask: "paramName=:paramValue"

    URL: "/page?paramName=valueOne"       -> paramValue = "valueOne"
    URL: "/page?paramName=value&two=true" -> paramValue = "value"
    URL: "/page?paramName=value#three"    -> paramValue = "value"

## Using Router.Link to Change URLs

`Router.Link` is a component that lets you change the URL without page reload, while still updating the values for `Router.Route` and redrawing the changed templates.

To change the URL, specify a mask for your change with the `href` option and then specify the values for placeholders. `Router.Link` uses [the same mask types](#mask-types) as `Router.Route` does.

**Example:**

    <Router.Link href="destination/:country" country="Italy">
       <span>Go to Italy</span>
    </Router.Link>

Clicking on the link in the example above would add the `destination/Italy` part to the URL if there is no `destination` it in currently, or would change the currently specified destination if it already has one. The rest of the URL stays unchanged.

    URL: "/book"                                          -> After click: "/book/destination/Italy"
    URL: "/book/destination/Russia"                       -> After click: "/book/destination/Italy"
    URL: "/book/destination/France/day/Tuesday?price=mid" -> After click: "/book/destination/Italy/day/Tuesday?price=mid"
    URL: "/book/all"                                      -> After click: "/book/all/destination/Italy"

### Specifying a Pretty URL

If you want the user to see a different URL than what it really is, specify the `prettyUrl` option. This string will be displayed in the user's address bar, but `Router.Route` and `Router.Link` components will still work with the *actual* URL.

**Example:**

    <Router.Link href="page/:pageType" pageType="register" prettyUrl="/signup">
      <span>Sign Up</span>
    </Router.Link>

When the user clicks the link in the example above, their URL changes to include `page/register` in it, but they see `/signup` in their address bar.

It is important to note, that if the user reloads the page while pretty URL is displayed, it becomes the *actual* URL after the reload, so `Router.Route`s that match the mask `page/:pageType` will stop matching against it.

### Clearing a Part of the URL

If you want `Router.Link` not to add or change the value specified by a mask, but to completely remove it from the URL, set the `clear` option to `true`. The rest of the URL stays unchanged.

**Example:**

    <Router.Link href="type/:regType" clear="{{true}}">
    	<span>Choose registration type</span>
    </Router.Link>

<!-- brk -->

    URL: "/signup/type/company" -> After click: "/signup"
    URL: "/signup" -> After click: "/signup"
    URL: "/signup/type/individual/oauth?ref=email" -> After click: "/signup/oauth?ref=email"

## How-to

This section contains a list of common tasks that **saby-router** helps to accomplish. Each task has a link to the demo code that can be a starting point of your solution. [Follow these steps](#running-the-demo) to run the demo.