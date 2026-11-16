import { listGoals } from './goals.js'
import { readDb } from './mockStore.js'

const SEASONS = ['봄', '여름', '가을', '겨울']

export function seasonKey(value) {
  const date = new Date(value)
  const month = date.getMonth() + 1
  const season = month >= 3 && month <= 5 ? 0 : month >= 6 && month <= 8 ? 1 : month >= 9 && month <= 11 ? 2 : 3
  return `${month <= 2 ? date.getFullYear() - 1 : date.getFullYear()}-${season}`
}

export function seasonLabel(key) {
  const [year, season] = key.split('-')
  return `${year} ${SEASONS[Number(season)]} 정원`
}

export async function getGarden({ signal } = {}) {
  await listGoals({ signal })
  const db = readDb()
  return db.goals.filter((goal) => goal.status !== 'deleted').map((goal) => ({
    goal,
    steps: db.steps.filter((step) => step.goalId === goal.id),
    season: seasonKey(goal.finishedAt ?? goal.createdAt),
  }))
}
