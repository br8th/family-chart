import assert from 'node:assert/strict'
import test from 'node:test'

import {calculateTree} from '../dist/family-chart.esm.js'

test('shows children shared by an added spouse and a co-spouse', () => {
  const data = [
    datum('alice', 'F', {spouses: ['david'], children: ['alice-child']}),
    datum('david', 'M', {spouses: ['alice', 'rhoda'], children: ['alice-child', 'angelina']}),
    datum('rhoda', 'F', {spouses: ['david'], children: ['angelina']}),
    datum('alice-child', 'F', {parents: ['alice', 'david']}),
    datum('angelina', 'F', {parents: ['david', 'rhoda']}),
  ]

  const result = calculateTree(data, {
    main_id: 'alice',
    single_parent_empty_card: false,
  })
  const ids = result.data.map(node => node.data.id)
  const david = result.data.find(node => node.data.id === 'david')
  const angelina = result.data.find(node => node.data.id === 'angelina')

  assert.deepEqual(ids.sort(), ['alice', 'alice-child', 'angelina', 'david', 'rhoda'])
  assert.equal(angelina?.parent?.data.id, 'david')
  assert.deepEqual(david?.spouses?.map(node => node.data.id), ['rhoda'])
  assert.deepEqual(david?.children?.map(node => node.data.id), ['angelina'])
})

function datum(id, gender, rels = {}) {
  return {
    id,
    data: {gender},
    rels: {
      parents: rels.parents || [],
      spouses: rels.spouses || [],
      children: rels.children || [],
    },
  }
}
