import { describe, it, expect } from 'vitest'
import { pushHistoryEntry } from './history'

describe('pushHistoryEntry', () => {
  it('pushes a new color onto the front', () => {
    expect(pushHistoryEntry(['#00FF00'], '#FF0000', 50)).toEqual(['#FF0000', '#00FF00'])
  })

  it('starts an empty history', () => {
    expect(pushHistoryEntry([], '#FF0000', 50)).toEqual(['#FF0000'])
  })

  it('dedupes against the head — no consecutive duplicate entries', () => {
    expect(pushHistoryEntry(['#FF0000', '#00FF00'], '#FF0000', 50)).toEqual([
      '#FF0000',
      '#00FF00',
    ])
  })

  it('still adds a color that reappears further back in history (only the head is deduped)', () => {
    expect(pushHistoryEntry(['#00FF00', '#FF0000'], '#FF0000', 50)).toEqual([
      '#FF0000',
      '#00FF00',
      '#FF0000',
    ])
  })

  it('caps at maxSize, dropping the oldest entries', () => {
    const history = ['#3', '#2', '#1']
    expect(pushHistoryEntry(history, '#4', 3)).toEqual(['#4', '#3', '#2'])
  })

  it('handles a maxSize of 0', () => {
    expect(pushHistoryEntry(['#1'], '#2', 0)).toEqual([])
  })
})
