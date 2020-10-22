import { debugOutput } from '../utils'

export default async function filter(data) {
  console.log('Removing US counties')
  let filtered = data.filter(
    ({ zone }) =>
      !zone.startsWith('United States|') || zone.split('|').length < 3
  )

  await debugOutput('filtered', filtered)

  return filtered
}
