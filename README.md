# corona

This is a Covid-19 cases visualisation app using CSSE and French Government data built with EmberJS. It runs completely in the browser and does not require a backend server.

Access the [live instance](https://corona.njoyard.fr/develop) of this app.

## About this app

### Data sources

TODO (in the meantime see `cruncher/sources/*.js`)

### License and developer info

The code for this app is released under the terms of the [MIT license](https://raw.githubusercontent.com/njoyard/corona/master/LICENSE).

Made with ♥ using [EmberJS](https://emberjs.com), [Ember Paper](https://miguelcobain.github.io/ember-paper) and [ChartJS](https://chartjs.org).

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (with npm and yarn, `npm install -g yarn`)
- [Ember CLI](https://ember-cli.com/) (`npm install -g ember-cli`)

### Installation

- `git clone https://github.com/njoyard/corona` this repository
- `cd corona`
- `yarn`

### Running / Development

- Run `DEV_OUTPUT=true yarn crunch` to generate the dataset
- Run `ember s` to start the development server
- Visit your app at [http://localhost:4200](http://localhost:4200).
- Visit your tests at [http://localhost:4200/tests](http://localhost:4200/tests).

#### Linting

- `npm run lint:hbs`
- `npm run lint:js`
- `npm run lint:js -- --fix`

#### Building

- `ember build` (development)
- `ember build --environment production` (or `yarn build`) (production)

Build output is stored in the `dist` folder. Use any web server to serve the contents of this directory to deploy your version of the app.
