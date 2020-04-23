import BaseDataSource from 'corona/datasources/-base'

let data = [
  {
    levels: ['A', 'A.a', 'A.a.1'],
    points: [
      {
        date: 1000000000,
        confirmed: 500,
        deceased: 0,
        recovered: 0
      },
      {
        date: 2000000000,
        confirmed: 1000,
        deceased: 100,
        recovered: 500
      }
    ],
    pop: 10000
  },
  {
    levels: ['A', 'A.a', 'A.a.2'],
    points: [
      {
        date: 1000000000,
        confirmed: 501,
        deceased: 1,
        recovered: 1
      },
      {
        date: 2000000000,
        confirmed: 1001,
        deceased: 101,
        recovered: 501
      }
    ],
    pop: 10000
  },
  {
    levels: ['A', 'A.b'],
    points: [
      {
        date: 1000000000,
        confirmed: 502,
        deceased: 2,
        recovered: 2
      },
      {
        date: 2000000000,
        confirmed: 1002,
        deceased: 102,
        recovered: 502
      }
    ],
    pop: 10000
  },
  {
    levels: ['B', 'B.a'],
    points: [
      {
        date: 1000000000,
        confirmed: 503,
        deceased: 3,
        recovered: 3
      },
      {
        date: 2000000000,
        confirmed: 1003,
        deceased: 103,
        recovered: 503
      }
    ],
    pop: 10000
  },
  {
    levels: ['B', 'B.b'],
    points: [
      {
        date: 1000000000,
        confirmed: 504,
        deceased: 4,
        recovered: 4
      },
      {
        date: 2000000000,
        confirmed: 1004,
        deceased: 104,
        recovered: 504
      }
    ],
    pop: 10000
  }
]

export default class TestDataSource extends BaseDataSource {
  async fetchData(cb) {
    for (let item of data) {
      cb(item.levels, item.points, item.pop, ['foo', 'bar', 'baz'])
    }
  }
}
