var test = require('tape')
var subject = require('../index')

test('AsyncArgs.select: subset of args is passed to next',
  function (t) {
    t.plan(2)
    var expected = 'c'
    subject.select(false, false, true)('a', 'b', 'c', function (err, actual) {
      t.error(err)
      t.equal(actual, expected)
    })
  })

test('AsyncArgs.select: jsonpointer works with object',
  function (t) {
    t.plan(2)
    var expected = 'c'
    subject.select(false, '/b')('a', {b:'c'}, function (err, actual) {
      t.error(err)
      t.equal(actual, expected)
    })
  })

test('AsyncArgs.select: jsonpointer works with array',
  function (t) {
    t.plan(2)
    var expected = 'c'

    subject.select(false, '/1')('a', ['b', 'c'], function (err, actual) {
      t.error(err)
      t.equal(actual, expected)
    })
  })

test('AsyncArgs.select: jsonpointer works with multiple arguments',
  function (t) {
    t.plan(3)
    var expected1 = 'b'
    var expected2 = 'd'
    var arg1 = {a: 'b'}
    var arg2 = ['c', 'd']
    subject.select('/a', '/1')(arg1, arg2, function (err, actual1, actual2) {
      t.error(err)
      t.equal(actual1, expected1)
      t.equal(actual2, expected2)
    })
  })

test('AsyncArgs.select: jsonpointer works with deeply nested object',
  function (t) {
    t.plan(2)
    var expected = 'h'
    var obj = {
      b:{
        c:{
          d:[
            'e',
            'f',
            {g: 'h'}
          ]
        }
      }
    }

    subject.select(false, '/b/c/d/2/g')('a', obj, function (err, actual) {
      t.error(err)
      t.equal(actual, expected)
    })
  })

test('asyncArgs.prependValues: prepends arguments to the next function',
  function (t) {
    t.plan(2)
    var subjectInstance = subject({
      'test': 'testValue'
    })
    var expected = 'testValue'
    subjectInstance.prependValues('test')('a', function (err, actual) {
      t.error(err)
      t.equal(actual, expected)
    })
  })

test('asyncArgs.appendValues: appends arguments to the next function',
  function (t) {
    t.plan(2)
    var subjectInstance = subject({
      'test': 'testValue'
    })
    var expected = 'testValue'
    subjectInstance.appendValues('test')('a', function (err, _, actual) {
      t.error(err)
      t.equal(actual, expected)
    })
  })

test('asyncArgs.values: sets arguments to the next function',
  function (t) {
    t.plan(2)
    var subjectInstance = subject({
      'test': 'testValue'
    })
    var expected = 'testValue'
    subjectInstance.values('test')('a', function (err, actual) {
      t.error(err)
      t.equal(actual, expected)
    })
  })

test('asyncArgs.prependConstants: prepends arguments to the next function',
  function (t) {
    t.plan(2)
    var expected = 'test'
    subject.prependConstants('test')('a', function (err, actual) {
      t.error(err)
      t.equal(actual, expected)
    })
  })

test('asyncArgs.appendConstants: appends arguments to the next function',
  function (t) {
    t.plan(2)
    var expected = 'test'
    subject.appendConstants('test')('a', function (err, _, actual) {
      t.error(err)
      t.equal(actual, expected)
    })
  })

test('asyncArgs.constants: sets arguments to the next function',
  function (t) {
    t.plan(2)
    var expected = 'test'
    subject.constants('test')('a', function (err, actual) {
      t.error(err)
      t.equal(actual, expected)
    })
  })

test('asyncArgs.store: passes through all values',
  function (t) {
    t.plan(3)
    var subjectInstance = subject()
    subjectInstance.store('test1', 'test2')('a', 'b', function (err, a, b) {
      t.error(err)
      t.equal(a, 'a')
      t.equal(b, 'b')
    })
  })

test('asyncArgs.store: stores values for later retrieval',
  function (t) {
    t.plan(3)
    var subjectInstance = subject()
    var expectedA = 'a'
    var expectedB = 'b'
    subjectInstance.store('test1', 'test2')('a', 'b', function (err, a, b) {
    })
    subjectInstance.values('test1', 'test2')(function (err, actualA, actualB) {
      t.error(err)
      t.equal(actualA, expectedA)
      t.equal(actualB, expectedB)
    })
  })
