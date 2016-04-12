var jp = require('jsonpointer')

function storeMetaFactory(lookup) {
  return function storeFactory() {
    var keys = Array.prototype.slice.call(arguments)
    return function store() {
      var args = Array.prototype.slice.call(arguments)
      var lastArgIndex = args.length - 1
      var next = args[lastArgIndex]
      args = args.slice(0, lastArgIndex)
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
        if (key) {
          lookup[key] = args[i]
        }
      }
      args.unshift(null)
      next.apply(null, args)
    }
  }
}

function valuesMetaFactory(lookup) {
  return function valuesFactory() {
    var keys = Array.prototype.slice.call(arguments)
    return function values() {
      var args = Array.prototype.slice.call(arguments)
      var lastArgIndex = args.length - 1
      var next = args[lastArgIndex]
      args = []
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
        args.push(lookup[key])
      }
      args.unshift(null)
      next.apply(null, args)
    }
  }
}

function appendValuesMetaFactory(lookup) {
  return function appendValuesFactory() {
    var keys = Array.prototype.slice.call(arguments)
    return function appendValues() {
      var args = Array.prototype.slice.call(arguments)
      var lastArgIndex = args.length - 1
      var next = args[lastArgIndex]
      args = args.slice(0, lastArgIndex)
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
        if (key) {
          args.push(lookup[key])
        }
      }
      args.unshift(null)
      next.apply(null, args)
    }
  }
}

function prependValuesMetaFactory(lookup) {
  return function prependValuesFactory() {
    var keys = Array.prototype.slice.call(arguments)
    return function prependValues() {
      var args = Array.prototype.slice.call(arguments)
      var lastArgIndex = args.length - 1
      var next = args[lastArgIndex]
      args = args.slice(0, lastArgIndex)
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
        if (key) {
          args.unshift(lookup[key])
        }
      }
      args.unshift(null)
      next.apply(null, args)
    }
  }
}

function constantsFactory() {
  var outterArgs = Array.prototype.slice.call(arguments)
  return function constants() {
    var args = Array.prototype.slice.call(arguments)
    var lastArgIndex = args.length - 1
    var next = args[lastArgIndex]
    args = outterArgs.slice()
    args.unshift(null)
    next.apply(null, args)
  }
}

function appendConstantsFactory() {
  var outterArgs = Array.prototype.slice.call(arguments)
  return function appendConstants() {
    var args = Array.prototype.slice.call(arguments)
    var lastArgIndex = args.length - 1
    var next = args[lastArgIndex]
    args = args.slice(0, lastArgIndex)
    args.push.apply(args, outterArgs)
    args.unshift(null)
    next.apply(null, args)
  }
}

function prependConstantsFactory() {
  var outterArgs = Array.prototype.slice.call(arguments)
  return function prependConstants() {
    var args = Array.prototype.slice.call(arguments)
    var lastArgIndex = args.length - 1
    var next = args[lastArgIndex]
    args = args.slice(0, lastArgIndex)
    args.unshift.apply(args, outterArgs)
    args.unshift(null)
    next.apply(null, args)
  }
}

function selectFactory (){
  var selectArgs = Array.prototype.slice.call(arguments)
  return function select(){
    var args = Array.prototype.slice.call(arguments)
    var lastArgIndex = args.length - 1
    var next = args[lastArgIndex]
    args = args.slice(0, lastArgIndex)
    var newArgs = []
    for (var i = 0; i < selectArgs.length; i++){
      var selectArg = selectArgs[i]
      if (selectArg){
        var arg = args[i]
        if (typeof selectArg === 'string' && selectArg.indexOf('/') === 0){
          newArgs.push(jp.get(arg, selectArg))
        } else if (selectArg instanceof Array){
          for (var j = 0; j < selectArg.length; j++){
            newArgs.push(jp.get(arg, selectArg[j]))
          }
        } else {
          newArgs.push(arg)
        }
      }
    }
    newArgs.unshift(null)
    next.apply(null, newArgs)
  }
}

function AsyncArgs(lookup) {
  lookup = lookup || {}
  return {
    store: storeMetaFactory(lookup),
    values: valuesMetaFactory(lookup),
    appendValues: appendValuesMetaFactory(lookup),
    prependValues: prependValuesMetaFactory(lookup),
    constants: constantsFactory,
    appendConstants: appendConstantsFactory,
    prependConstants: prependConstantsFactory,
    select: selectFactory
  }
}

AsyncArgs.constants = constantsFactory
AsyncArgs.appendConstants = appendConstantsFactory
AsyncArgs.prependConstants = prependConstantsFactory
AsyncArgs.select = selectFactory

module.exports = AsyncArgs