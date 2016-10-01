// @flow

import _test from 'lobot/test'
import Task from '../src'

const test = _test.wrap('parallel')

test('works with of', 1, t => {
  Task.parallel([Task.of(2), Task.of('42')]).run(t.calledWith([2, '42']))
})

test('works with rejected', 1, t => {
  Task.parallel([Task.of(2), Task.rejected('42')]).run({failure: t.calledWith('42')})
})

test('cancelation works', 2, t => {
  Task.parallel([
    Task.create(() => t.calledOnce()),
    Task.create(() => t.calledOnce()),
  ]).run({})()
})

test('after one task fails others are canceled (sync fail)', 1, t => {
  Task.parallel([
    Task.rejected(2),
    Task.create(() => t.calledOnce()),
  ]).run({failure(){}})
})

test('after one task fails others are canceled (async fail)', 1, t => {
  let f = (null: any)
  Task.parallel([
    Task.create((_, _f) => { f = _f }),
    Task.create(() => t.calledOnce()),
  ]).run({failure(){}})
  f()
})

const of1 = Task.of(1)
const thrower1 = Task.create(() => { throw new Error('err1') })
const thrower2 = Task.create(() => { throw 2 })

test('exception thrown in a child task (no catch cb)', 2, t => {
  t.throws(() => {
    Task.parallel([of1, thrower1]).run({})
  }, /err1/)
  t.throws(() => {
    Task.parallel([thrower1, of1]).run({})
  }, /err1/)
})

test('exception thrown in a child task (with catch cb, exception is the first completion)', 1, t => {
  Task.parallel([thrower2, of1]).run({catch: t.calledWith(2), success: t.fail})
})

test('exception thrown in a child task (with catch cb, exception is the second completion)', 1, t => {
  Task.parallel([of1, thrower2]).run({catch: t.calledWith(2), success: t.fail})
})

test('this==undefined in success cd', 1, t => {
  Task.parallel([Task.of(2)]).run({success() { t.equal(this, undefined) }})
})

test('this==undefined in failure cd', 1, t => {
  Task.parallel([Task.rejected(2)]).run({failure() { t.equal(this, undefined) }})
})


// Flow tests

/* eslint-disable no-unused-vars */

const t1: Task<[number, string], *> = Task.parallel([Task.of(2), Task.of('')])

// $FlowFixMe
const t2: Task<[number, number], *> = Task.parallel([Task.of(2), Task.of('')])

Task.parallel([Task.of(2), Task.of('')]).run({success(xs) {
  (xs[0]: number);
  (xs[1]: string);
  // $FlowFixMe
  (xs[0]: string);
  // $FlowFixMe
  (xs[1]: number);
}})

/* eslint-enable no-unused-vars */
