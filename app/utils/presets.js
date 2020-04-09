import { htmlSafe } from '@ember/template'

class Preset {
  title = null
  _description = null
  params = null

  constructor({ title, description, params }) {
    this.title = title
    this._description = description
    this.params = params
  }

  get description() {
    return htmlSafe(this._description)
  }
}

const presets = {
  tendency: new Preset({
    title: 'Tendency',
    description: `
      Shows the tendency of daily new cases per million capita with a moving average since the 50th confirmed case in each region. This preset
      gives a hint on whether each region manages to "flatten the curve".
    `,
    params: {
      xSelection: 'start',
      xLog: false,

      ySelection: 'confirmed',
      yChange: true,
      yMovingAverage: true,
      yLog: false,
      yRatio: true,

      stacked: false
    }
  }),

  aatishb: new Preset({
    title: 'Trajectory of confirmed cases',
    description: `
      Reproduces Aatish Bhatia's <a target="_blank" rel="noopener noreferrer" href="//aatishb.com/covidtrends/">Covid Trends chart</a>
      showing a log-log chart of daily new cases in relation to confirmed cases, also shown in MinutePhysics'
      <a target="_blank" rel="noopener noreferrer" href="//www.youtube.com/watch?v=54XLXg4fYsc">How To Tell If We're Beating COVID19</a> video.
    `,
    params: {
      xSelection: 'confirmed',
      xLog: true,

      ySelection: 'confirmed',
      yChange: true,
      yMovingAverage: true,
      yLog: true,
      yRatio: false,

      stacked: false
    }
  }),

  deathtoll: new Preset({
    title: 'Death toll',
    description: `
      Stacks fatalities from selected regions over time.
    `,
    params: {
      xSelection: 'date',
      xLog: false,

      ySelection: 'deceased',
      yChange: false,
      yLog: false,
      yRatio: false,

      stacked: true
    }
  }),

  mortality: new Preset({
    title: 'Mortality rate',
    description: `
      Shows fatalities in relation to confirmed cases for each selected region. This gives a hint at the mortality rate (more vertical curves
      means a greater rate) and its evolution, but keep in mind that this is also affected by how each region counts fatalities and confirmed
      cases (countries that do more testing will have a lower rate for example).
    `,
    params: {
      xSelection: 'confirmed',
      xLog: false,

      ySelection: 'deceased',
      yChange: false,
      yLog: false,
      yRatio: false,

      stacked: false
    }
  }),

  active: new Preset({
    title: 'Evolution of active cases per capita',
    description: `
      Shows the evolution of estimated active cases (subtracting deaths and recoveries from confirmed cases) per million inhabitants for each
      selected region since the 50th confirmed case.
    `,
    params: {
      xSelection: 'start',
      xLog: false,

      ySelection: 'active',
      yChange: false,
      yLog: false,
      yRatio: true,

      stacked: false
    }
  })
}

export default presets
