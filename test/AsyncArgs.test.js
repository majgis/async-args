var test = require('tape');
var subject = require('../index');

function hookStdout (callback) {
  var oldWrite = process.stdout.write;

  process.stdout.write = (function (write) {
    return function (string, encoding, fd) {
      write.apply(process.stdout, arguments);
      callback(string, encoding, fd);
    };
  })(process.stdout.write);

  return function () {
    process.stdout.write = oldWrite;
  };
}

test('AsyncArgs.select: subset of args is passed to next',
  function (t) {
    t.plan(2);
    var expected = 'c';
    subject.select(false, false, true)('a', 'b', 'c', function (err, actual) {
      t.error(err);
      t.equal(actual, expected);
    });
  });

test('AsyncArgs.select: jsonpointer works with object',
  function (t) {
    t.plan(2);
    var expected = 'c';
    subject.select(false, '/b')('a', {b: 'c'}, function (err, actual) {
      t.error(err);
      t.equal(actual, expected);
    });
  });

test('AsyncArgs.select: jsonpointer works with array',
  function (t) {
    t.plan(2);
    var expected = 'c';

    subject.select(false, '/1')('a', ['b', 'c'], function (err, actual) {
      t.error(err);
      t.equal(actual, expected);
    });
  });

test('AsyncArgs.select: jsonpointer works with multiple arguments',
  function (t) {
    t.plan(3);
    var expected1 = 'b';
    var expected2 = 'd';
    var arg1 = {a: 'b'};
    var arg2 = ['c', 'd'];
    subject.select('/a', '/1')(arg1, arg2, function (err, actual1, actual2) {
      t.error(err);
      t.equal(actual1, expected1);
      t.equal(actual2, expected2);
    });
  });

test('AsyncArgs.select: jsonpointer works with deeply nested object',
  function (t) {
    t.plan(2);
    var expected = 'h';
    var obj = {
      b: {
        c: {
          d: [
            'e',
            'f',
            {g: 'h'}
          ]
        }
      }
    };

    subject.select(false, '/b/c/d/2/g')('a', obj, function (err, actual) {
      t.error(err);
      t.equal(actual, expected);
    });
  });

test('AsyncArgs.select: array of jsonpointers ',
  function (t) {
    t.plan(3);
    var expected1 = 'h';
    var expected2 = 'e';
    var obj = {
      b: {
        c: {
          d: [
            'e',
            'f',
            {g: 'h'}
          ]
        }
      }
    };
    var selector = ['/b/c/d/2/g', '/b/c/d/0'];
    subject.select(false, selector)('a', obj, function (err, actual1, actual2) {
      t.error(err);
      t.equal(actual1, expected1);
      t.equal(actual2, expected2);
    });
  });

test('asyncArgs.prependValues: prepends arguments to the next function',
  function (t) {
    t.plan(3);
    var subjectInstance = subject({
      'test1': 'testValue1',
      'test2': 'testValue2'
    });
    var expected1 = 'testValue1';
    var expected2 = 'testValue2';
    subjectInstance.prependValues('test1', 'test2')('a',
      function (err, actual1, actual2) {
        t.error(err);
        t.equal(actual1, expected1);
        t.equal(actual2, expected2);
      }
    );
  });

test('asyncArgs.appendValues: appends arguments to the next function',
  function (t) {
    t.plan(2);
    var subjectInstance = subject({
      'test': 'testValue'
    });
    var expected = 'testValue';
    subjectInstance.appendValues('test')('a', function (err, _, actual) {
      t.error(err);
      t.equal(actual, expected);
    });
  });

test('asyncArgs.values: sets arguments to the next function',
  function (t) {
    t.plan(2);
    var subjectInstance = subject({
      'test': 'testValue'
    });
    var expected = 'testValue';
    subjectInstance.values('test')('a', function (err, actual) {
      t.error(err);
      t.equal(actual, expected);
    });
  });

test('asyncArgs.prependConstants: prepends arguments to the next function',
  function (t) {
    t.plan(3);
    var expected1 = 'test1';
    var expected2 = 'test2';
    subject.prependConstants('test1', 'test2')('a',
      function (err, actual1, actual2) {
        t.error(err);
        t.equal(actual1, expected1);
        t.equal(actual2, expected2);
      }
    );
  });

test('asyncArgs.appendConstants: appends arguments to the next function',
  function (t) {
    t.plan(2);
    var expected = 'test';
    subject.appendConstants('test')('a', function (err, _, actual) {
      t.error(err);
      t.equal(actual, expected);
    });
  });

test('asyncArgs.constants: sets arguments to the next function',
  function (t) {
    t.plan(2);
    var expected = 'test';
    subject.constants('test')('a', function (err, actual) {
      t.error(err);
      t.equal(actual, expected);
    });
  });

test('asyncArgs.store: passes through all values',
  function (t) {
    t.plan(3);
    var subjectInstance = subject();
    subjectInstance.store('test1', 'test2')('a', 'b', function (err, a, b) {
      t.error(err);
      t.equal(a, 'a');
      t.equal(b, 'b');
    });
  });

test('asyncArgs.store: stores values for later retrieval',
  function (t) {
    t.plan(4);
    var subjectInstance = subject();
    var expectedA = 'a';
    var expectedB = 'b';
    subjectInstance.store('test1', 'test2')('a', 'b', function (err, a, b) {
      t.error(err);
    });
    subjectInstance.values('test1', 'test2')(function (err, actualA, actualB) {
      t.error(err);
      t.equal(actualA, expectedA);
      t.equal(actualB, expectedB);
    });
  });

test('AsyncArgs.debug: logs default message',
  function (t) {
    t.plan(2);
    var actual;
    var unhook = hookStdout(function (stdout) {
      actual = stdout;
    });
    var expected = "AsyncArgs: [ 'a', 'b' ]\n";
    subject.debug()('a', 'b', function (err) {
      t.error(err);
      t.equal(actual, expected);
    });
    unhook();
  });

test('AsyncArgs.debug: logs custom message',
  function (t) {
    t.plan(2);
    var actual;
    var unhook = hookStdout(function (stdout) {
      actual = stdout;
    });
    var expected = "test [ 'a', 'b' ]\n";
    subject.debug('test')('a', 'b', function (err) {
      t.error(err);
      t.equal(actual, expected);
    });
    unhook();
  });

test('AsyncArgs.debug: uses custom logger',
  function (t) {
    t.plan(2);
    var actual;
    var unhook = hookStdout(function (stdout) {
      actual = stdout;
    });
    var logger = function (msg, args) {
      console.log(msg + 'xxx');
    };
    var expected = 'testxxx\n';
    subject.debug('test', logger)('a', 'b', function (err) {
      t.error(err);
      t.equal(actual, expected);
    });
    unhook();
  });

test('asyncArgs.debug: passes through all arguments',
  function (t) {
    t.plan(3);
    subject.debug()('a', 'b', function (err, a, b) {
      t.error(err);
      t.equal(a, 'a');
      t.equal(b, 'b');
    });
  });

test('asyncArgs.order: reorders args',
  function (t) {
    t.plan(5);
    var expected0 = '2';
    var expected1 = '3';
    var expected2 = '0';
    var expected3 = '1';
    subject.order(2, 3, 0, 1)('0', '1', '2', '3',
      function (err, actual0, actual1, actual2, actual3) {
        t.error(err);
        t.equal(actual0, expected0);
        t.equal(actual1, expected1);
        t.equal(actual2, expected2);
        t.equal(actual3, expected3);
      }
    );
  });
