# corona

This is a Covid-19 cases visualisation app using CSSE data built with EmberJS.  It runs completely in the browser and does not require a backend server.

Access the [live instance](https://corona.njoyard.fr) of this app.

## Prerequisites

* [Node.js](https://nodejs.org/) (with npm and yarn, `npm install -g yarn`)
* [Ember CLI](https://ember-cli.com/) (`npm install -g ember-cli`)

## Installation

* `git clone https://github.com/njoyard/corona` this repository
* `cd corona`
* `yarn`

## Running / Development

* `ember s`
* Visit your app at [http://localhost:4200](http://localhost:4200).
* Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

### Linting

* `npm run lint:hbs`
* `npm run lint:js`
* `npm run lint:js -- --fix`

### Building

* `ember build` (development)
* `ember build --environment production` (or `yarn build`) (production)

Build output is stored in the `dist` folder.  Use any web server to serve the contents of this directory to deploy your version of the app.