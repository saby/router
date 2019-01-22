# saby-router

**saby-router** provides modules and components that help you to implement a single-page application.

## Table of Contents

  * [Enabling the Single Page Routing](#enabling-the-single-page-routing)
  * [Running the Tests](#running-the-tests)
  * [Running the Demo](#running-the-demo)
  * [Using Router.Route to Match URLs](#using-routerroute-to-match-urls)
    * [Mask Types](#mask-types)
    * [Opening and Closing Popups on URL Change](#opening-and-closing-popups-on-url-change)
  * [Using Router.Reference to Change URLs](#using-routerreference-to-change-urls)
    * [Specifying a Pretty URL](#specifying-a-pretty-url)
    * [Clearing a Part of the URL](#clearing-a-part-of-the-url)

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

For **saby-router** components and modules to work, the page has to have a `Router.Controller` component in it. All nested components will have access to the single page routing mechanisms.

The pages built from an `.html.tmpl` file and application components rendered inside of `Controls/Application/Route` already include the controller in it by default, it should not be inserted manually.

## Using Router.Route to Match URLs

`Router.Route` is a component that matches URLs and extracts values from them.

This component has a `mask` option. Mask is a string that contains a special placeholder that starts with a colon character (:) and represents an arbitrary parameter in the URL. The value of this parameter is extracted from the URL when it changes and is passed inside of the `Router.Route` with the same name as the placeholder itself.

**Example:**

    <Router.Route mask="destination/:myDestination">
       <p>Selected destination: {{ content.myDestination }}</p>
    </Router.Route>

In the example above, if the URL contains the substring `destination/Italy`, the user will see `Selected destination: Italy`. If the URL doesn't match the mask `destination/*` at all, `myDestination` will be undefined.

### Mask Types

`Router.Route` supports two mask types: standard param and query param.

#### Standard Param Mask

Standard param mask looks like `paramName/:paramValue` and can contain any number of placeholders, for example `tour/:priceMin/:priceMax`. It matches any URL that contains the
mask.

Placeholder value for standard param mask ends when the URL ends, or when a `#`, `/` or `?` character is encountered.

**Example:**

    Mask: "paramName/:paramValue"

    URL: "/paramName/valueOne"        -> paramValue = "valueOne"
    URL: "/paramName/value/Two"       -> paramValue = "value"
    URL: "/paramName/value?num=three" -> paramValue = "value"
    URL: "/paramName/value#Four"      -> paramValue = "value"

#### Query Param Mask

Query param mask looks like `paramName=:paramValue` and has to contain exactly one placeholder. It matches and extracts the placeholder value from any URL that contains the specified query param, for example the URL `/mypurchases?filtered=true&paramName=age&greaterthan=2` would match the mask, and the extracted value would be `age`.

Placeholder value for query param mask ends when the URL ends, or when `#` or `&` character is encountered.

**Example:**

    Mask: "paramName=:paramValue"

    URL: "/page?paramName=valueOne"       -> paramValue = "valueOne"
    URL: "/page?paramName=value&two=true" -> paramValue = "value"
    URL: "/page?paramName=value#three"    -> paramValue = "value"

### Opening and Closing Popups on URL Change

`Router.Route` has two events: `on:enter` fires when the current URL starts to match this route's mask, and `on:leave` fires when the current URL no longer matches the specified mask.

**Example:**

    <Router.Route mask="search/:query">...</Router.Route>

    Current URL: "/home"
    Go to: "/page/search/My+query"           -> on:enter fires
    Then go to: "/page/search/Another+query" -> no events fired
    Then go to: "/about"                     -> on:leave fires

These events can be used to perform custom actions when the URL changes, for example to open popup windows.

**Example:**

    <Router.Route mask="alert/:popupInfo" on:enter="showPopup()" on:leave="closePopup()" />

    Current URL: "/home"
    Go to: "/home/alert/signup" -> showPopup() is executed
    Go to: "/home"              -> closePopup() is executed

#### Opening Recursive Popups

Sometimes the popup has to be able to open the copy of itself with different parameters. For example the user might want to click on a link inside of a product card to open another card of a related product. For this to work, these popups have to use different URL masks, because they shouldn't open and close simultaneously. This can be done multiple ways, but one of them is implementing a `depth` option for the popup component and using it to generate different route masks for different level popups.

**Example:**

    <!-- inside of the popup template -->
    <Router.Route mask="alert/{{_options.depth + 1}}/:popupInfo" on:enter="openPopupRecursive()" on:leave="closePopupRecursive()" />
    <Router.Reference mask="alert/{{_options.depth + 1}}/:popupInfo" popupInfo="{{ _productId }}" />

`Router.Reference` and `Router.Route` in the root component should open the first popup with the `depth` option set to `0`.

This example is implemented in the `Popups` demo page that [can be seen here](RouterDemo/Popups.ts). However, this implementation leads to a fast growing URL (if the user recursively opens multiple popups). [The href option of the Router.Reference component](#specifying-a-pretty-url) can be used to hide the full URL from the user. The example that uses this option is implemented in the `PopupsPretty` demo page that [can be seen here](RouterDemo/PopupsPretty.ts).

It is important to note, that if the actual URL is hidden with `href` and the user reloads the page in their browser, it will not be possible to restore the same popup structure, because the real URL will be lost. This can be tested by opening multiple popups on the demo page and then pressing F5. The popups on the `Popups` page will reopen automatically, but the ones on the `PopupsPretty` page they will be lost.

## Using Router.Reference to Change URLs

`Router.Reference` is a component that changes the URL without page reload on click, while still updating the values for `Router.Route`, which causes changed templates to update and redraw.

The `state` option specifies the mask for URL change, and the rest of the options specify the values for the placeholders. `Router.Reference` uses [the same mask types](#mask-types) as `Router.Route`.

**Example:**

    <Router.Reference state="destination/:country" country="Italy">
       <span>Go to Italy</span>
    </Router.Reference>

Clicking on the link in the example above would add the `destination/Italy` part to the URL if it currently does not contain `destination`, and would change the currently specified destination otherwise. The rest of the URL stays unchanged.

    URL: "/book"                                          -> After click: "/book/destination/Italy"
    URL: "/book/destination/Russia"                       -> After click: "/book/destination/Italy"
    URL: "/book/destination/France/day/Tuesday?price=mid" -> After click: "/book/destination/Italy/day/Tuesday?price=mid"
    URL: "/book/all"                                      -> After click: "/book/all/destination/Italy"

### Specifying a Pretty URL

The `href` option can be specified, if the actual URL should be hidden from the user. This string will be displayed in the user's address bar, but `Router.Route` and `Router.Reference` components will still work with the *actual* URL.

**Example:**

    <Router.Reference state="page/:pageType" pageType="register" href="/signup">
      <span>Sign Up</span>
    </Router.Reference>

When the user clicks the link in the example above, their URL changes to include `page/register` in it, but they see `/signup` in their address bar.

It is important to note, that if the user reloads the page while pretty URL is displayed, it becomes the *actual* URL after the reload. Because of this, `Router.Route`s that match the mask `page/:pageType` in the example above will stop matching against it, since `/signup` becomes the actual URL after reload.

### Clearing a Part of the URL

If `Router.Reference` should not add or change the value specified by a mask, but completely remove it from the URL, the `clear` option should be set to `true`. The part of the URL that matches the mask will be removed and the rest of it stays unchanged.

**Example:**

    <Router.Reference state="type/:regType" clear="{{true}}">
    	<span>Choose registration type</span>
    </Router.Reference>

<!-- brk -->

    URL: "/signup/type/company"                    -> After click: "/signup"
    URL: "/signup"                                 -> After click: "/signup"
    URL: "/signup/type/individual/oauth?ref=email" -> After click: "/signup/oauth?ref=email"
