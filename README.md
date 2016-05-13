#async-args

[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

A utility for use in conjunction with [async][2]
or similar libraries to help with passing and storing arguments between 
asynchronous functions.

Inspiration comes from:

 * using [async.waterfall][0] which is shown in the examples.
 * using [async.constant][1] and wanting more

This utility aspires to facilitate the following goals:

* Keep chained functions as generic as possible
    * Maximize reuse
    * Simpler to reason about
    
* Minimize defining functions within other functions:
    * Improve readability
    * Maximize reuse.

The disadvantage to these goals, similar to a microservices architecture, is 
that it pushes complexity to the integration layer.  This library is intended to 
help manage that complexity.

## Concepts

Think of async-args as a collection of factory functions which produce
async functions to replace, select, or insert arguments.  You can explore an
interactive code example [here][3].

## API

[Static Usage](#static-usage)

* [constants](#asyncargsconstantsconstant-constant-)
* [appendConstants](#asyncargsappendconstantsconstant-constant-)
* [prependConstants](#asyncargsprependconstantsconstant-constant-)
* [select](#asyncargsselectselector-selector-)
* [order](#asyncargsorderinteger-integer-)
* [debug](#asyncargsdebugmsg-logger)

[Instance Usage](#instance-usage)  
The same static methods as above are available, in addition to the following:

* [store](#asyncargsstorekey1-key2-)
* [values](#asyncargsvalueskey1-key2-)
* [appendValues](#asyncargsappendvalueskey1-key2-)
* [prependValues](#asyncargsprependvalueskey1-key2-)

## Static Usage

The static library is returned from the require statement

    AsyncArgs = require('async-args')
    
The following methods are available:

###AsyncArgs.constants([constant], [constant], ...)

Pass constants as arguments to the adjoining function.  Arguments from the 
preceding function are omitted.  This method is equivalent to 
[async.constant][1].

    async.waterfall([
      AsyncArgs.constants('arg1'),  // (next)
      aFunctionTakingOneArg         // (arg1, next)
    ], next)


###AsyncArgs.appendConstants([constant], [constant], ...)

Append constants to the arguments coming from the preceding function.

    async.waterfall([
      outputArg1,                         // (next)
      AsyncArgs.appendConstants('arg2'),  // (arg1, next)
      aFunctionTakingTwoArgs              // (arg1, arg2, next)
    ], next)

###AsyncArgs.prependConstants([constant], [constant], ...)

Prepend constants to the arguments coming from the preceding function

    async.waterfall([
      outputArg1,                          // (next)
      AsyncArgs.prependConstants('arg2'),  // (arg1, next)
      aFunctionTakingTwoArgs               // (arg2, arg1, next)
    ], next)

###AsyncArgs.select([selector], [selector], ...])

**selector:** boolean, [JSON Pointer][4] or array of JSON Pointers

A selector can be a string, to select a subset of arguments coming from the 
preceding function.  

    async.waterfall([
      outputArg1Arg2Arg3,                    // (next)
      AsyncArgs.select(false, false, true),  // (arg1, arg2, arg3, next)
      aFunctionTakingOneArg                  // (arg3, next)
    ], next)

A selector can be a [JSON Pointer][4], to select an array item or object 
property from an argument.

    var constant = {a:{b:['c','d']}}
    async.waterfall([
      AsyncArgs.constants(constant, constant), // (next)
      AsyncArgs.select('/a/b/1', /a/b/0'),     // (constant, constant, next)
      aFunctionTakingTwoArgs                   // ('d', 'c', next)
    ], next)
    
A selector can be an array of [JSON Pointers][4], to select multiple array 
items or object properties from a single argument.

    var constant = {a:{b:['c','d']}}
    async.waterfall([
      AsyncArgs.constants(constant),          // (next)
      AsyncArgs.select(['/a/b/1', /a/b/0']),  // (constant, next)
      aFunctionTakingTwoArgs                  // ('d', 'c', next)
    ], next)

###AsyncArgs.order([integer], [integer], ...)

Change the order of the arguments.

    async.waterfall([
      outputArg1Arg2Arg3,        // (next)
      AsyncArgs.order(2, 0, 1),  // (arg1, arg2, arg3, next)
      aFunctionTakingThreeArgs   // (arg3, arg1, arg2, next)
    ], next)

###AsyncArgs.debug([msg, [logger]])

**msg:**  A string that replaces the default "AsyncArgs:" prefix  
**logger:** A function taking msg as the first argument and args array as the 
second. The default is console.log.

Output what the current arguments are.  All arguments pass through. 

    async.waterfall([
      outputArg1Arg2Arg3,  // (next)
      AsyncArgs.debug()    // (arg1, arg2, arg3, next)
    ], next)
    
    // Output to console:
    // AsyncArgs: [ 'arg1', 'arg2', 'arg3' ]

## Instance Usage

An instance is returned by calling the static library, which allows the storing 
and retrieving of values from a context object.

    var asyncArgs = AsyncArgs()

You can prepopulate the context object when the instance is first created:

    var context = {
      'key1': 'value1',
      'key2': 'value2'
     }
    var asyncArgs = AsyncArgs(context)

This context object is updated in place (no copy is made), so if you want 
synchronous access to these values, follow this example to reference the context 
for later use.
    
The same static methods as above are available, along with the following 
methods unique to instances:

###asyncArgs.store([key1], [key2], ...)

Store selected arguments coming from the previous function to the context 
object.  Arguments from the preceding function pass through.

    async.waterfall([
      outputArg1Arg2Arg3,                       // (next)
      asyncArgs.store('arg1', 'arg2', 'arg3'),  // (arg1, arg2, arg3, next)
      aFunctionTakingThreeArgs                  // (arg1, arg2, arg3, next)
    ], next)

###asyncArgs.values([key1], [key2], ...)

Pull specific values from the context object and pass as arguments to the 
adjoining function.  Arguments from the preceding function are omitted.

    async.waterfall([
      outputArg1Arg2Arg3,                       // (next)
      asyncArgs.store('arg1', 'arg2', 'arg3'),  // (arg1, arg2, arg3, next)
      aFunctionTakingThreeArgsAndOutputArg4,    // (arg1, arg2, arg3, next)
      asyncArgs.values('arg2'),                 // (arg4, next)
      aFunctionTakingOneArg                     // (arg2, next)     
    ], next)

###asyncArgs.appendValues([key1], [key2], ...)

Pull specific values from the context object and append to the arguments coming
from the preceding function. 

    async.waterfall([
      outputArg1Arg2Arg3,                       // (next)
      asyncArgs.store('arg1', 'arg2', 'arg3'),  // (arg1, arg2, arg3, next)
      aFunctionTakingThreeArgsAndOutputArg4,    // (arg1, arg2, arg3, next)
      asyncArgs.appendValues('arg2'),           // (arg4, next)
      aFunctionTakingTwoArgs                    // (arg4, arg2, next)
    ], next)

###asyncArgs.prependValues([key1], [key2], ...)

Pull specific values from the context object and prepend to the arguments coming
from the preceding function.

    async.waterfall([
      outputArg1Arg2Arg3,                       // (next)
      asyncArgs.store('arg1', 'arg2', 'arg3'),  // (arg1, arg2, arg3, next)
      aFunctionTakingThreeArgsAndOutputArg4,    // (arg1, arg2, arg3, next)
      asyncArgs.prependValues('arg2'),          // (arg4, next)
      aFunctionTakingTwoArgs                    // (arg2, arg4, next)
    ], next)

[0]: https://www.npmjs.com/package/async#waterfalltasks-callback
[1]: https://www.npmjs.com/package/async#constantvalues
[2]: https://www.npmjs.com/package/async
[3]: https://tonicdev.com/majgis/async-args
[4]: https://www.npmjs.com/package/jsonpointer
