import fetchText from 'corona/utils/fetch-text'

/*
  Data sources must extend this class.
  
  Use await `this.fetchText(url)` to fetch text from an URL.
  
  Implement the `fetchData` method asynchronously (try to parallelize async calls if possible).

  To return data, this method must use its `dataCallback` argument which has the following signature:
    `dataCallback(regionLevels, points, population, levelLabels)`

  All calls to `dataCallback` must be done BEFORE `fetchData` returns.

    - `regionLevels` is an array that specifies the region points/population concern. It
      must be a non-empty array of geographic subdivisions of ascending precision, with the country
      as first item (eg. ['United States', 'Arizona', 'Maricopa', 'Phoenix', 'Central City']).
      The subdivision naming scheme must match other datasources to avoid duplicates.
    - `points` is an array of data point for that region. It may be empty for a call that just
      specifies population. Each point must have a `date` key (with a Date as value) and
      may have any number of other fields. Use the same field names as other datasources (eg.
      'confirmed', 'recovered', 'deceased'...). If points already exist for that region, points
      with the same date are merged together (replacing existing property values) and points with
      new dates are added. Note that all points in a single `dataCallback` call MUST have the same
      fields.
    - `population` will replace any previous value set for that region, can be set to null if unknown
    - `levelLabels` is an array of type labels for the corresponding levels (eg ['country', 'region'...])

  Multiple calls for the same region can be made. 

  Population and point fields will be summed up to compute totals for parent regions (ie. it is
  not required to specify cases both for a region and the whole country).  
 */

export default class BaseDataSource {
  fetchText(url, key) {
    return fetchText(url, key)
  }

  async fetchData(/* dataCallback */) {
    throw new Error('Not implemented')
  }
}
