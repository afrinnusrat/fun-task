// @flow

import _test from 'lobot/test'
import Task from '../src'

const test = _test.wrap('ap')

test('works', 1, t => {
  Task.of(2).ap(Task.of(x => x + 1)).run(t.calledWith(3))
})

test('static alias works', 1, t => {
  Task.ap(Task.of(x => x + 1), Task.of(2)).run(t.calledWith(3))
})
