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

test('reserves layout space for children across multiple spouses', () => {
  const aliceChildren = Array.from({length: 6}, (_, index) => `alice-child-${index}`)
  const rhodaChildren = Array.from({length: 5}, (_, index) => `rhoda-child-${index}`)
  const data = [
    datum('alice', 'F', {spouses: ['david'], children: aliceChildren}),
    datum('david', 'M', {spouses: ['alice', 'rhoda'], children: [...aliceChildren, ...rhodaChildren]}),
    datum('rhoda', 'F', {spouses: ['david'], children: rhodaChildren}),
    ...aliceChildren.map(id => datum(id, 'F', {parents: ['alice', 'david']})),
    ...rhodaChildren.map(id => datum(id, 'F', {parents: ['david', 'rhoda']})),
  ]

  const result = calculateTree(data, {
    main_id: 'alice',
    node_separation: 255,
    single_parent_empty_card: false,
  })
  const children = result.data
    .filter(node => node.depth === 1)
    .sort((left, right) => left.x - right.x)
  const david = result.data.find(node => node.data.id === 'david')

  for (let index = 1; index < children.length; index++) {
    assert.ok(
      children[index].x - children[index - 1].x >= 255,
      `${children[index - 1].data.id} and ${children[index].data.id} overlap`,
    )
  }
  assert.deepEqual(
    david?.children?.map(node => node.data.id).sort(),
    rhodaChildren,
  )
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
