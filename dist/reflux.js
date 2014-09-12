!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Reflux=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  if (!this._events || !this._events[event]) return [];

  for (var i = 0, l = this._events[event].length, ee = []; i < l; i++) {
    ee.push(this._events[event][i].fn);
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  if (!this._events || !this._events[event]) return false;

  var listeners = this._events[event]
    , length = listeners.length
    , len = arguments.length
    , ee = listeners[0]
    , args
    , i, j;

  if (1 === length) {
    if (ee.once) this.removeListener(event, ee.fn, true);

    switch (len) {
      case 1: return ee.fn.call(ee.context), true;
      case 2: return ee.fn.call(ee.context, a1), true;
      case 3: return ee.fn.call(ee.context, a1, a2), true;
      case 4: return ee.fn.call(ee.context, a1, a2, a3), true;
      case 5: return ee.fn.call(ee.context, a1, a2, a3, a4), true;
      case 6: return ee.fn.call(ee.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    ee.fn.apply(ee.context, args);
  } else {
    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = [];
  this._events[event].push(new EE( fn, context || this ));

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = [];
  this._events[event].push(new EE(fn, context || this, true ));

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, once) {
  if (!this._events || !this._events[event]) return this;

  var listeners = this._events[event]
    , events = [];

  if (fn) for (var i = 0, length = listeners.length; i < length; i++) {
    if (listeners[i].fn !== fn && listeners[i].once !== once) {
      events.push(listeners[i]);
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) this._events[event] = events;
  else this._events[event] = null;

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) this._events[event] = null;
  else this._events = {};

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the module.
//
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.EventEmitter2 = EventEmitter;
EventEmitter.EventEmitter3 = EventEmitter;

if ('object' === typeof module && module.exports) {
  module.exports = EventEmitter;
}

},{}],2:[function(_dereq_,module,exports){
var createAction = _dereq_('./createAction');

var slice = Array.prototype.slice;

/**
 * Track a set of Actions and Stores. Use Reflux.all if you need to handle
 * data coming in parallel.
 *
 * @param {...Action|Store} listenables Actions and Stores that should be
 *  tracked.
 * @returns {Action} An action which tracks the provided Actions and Stores.
 *  The action will emit once all of the provided listenables have emitted at
 *  least once.
 */
module.exports = function(/* listenables... */) {
    var numberOfListenables = arguments.length,
        // create a new array of the expected size. The initial
        // values will be falsy, which is fine for us.
        // Once each item in the array is truthy, the callback can be called
        listenablesEmitted,
        // these arguments will be used to *apply* the action.
        args,
        // this action combines all the listenables
        action = createAction();

    action.hasListener = function(listenable) {
        var i = 0, listener;

        for (; i < args.length; ++i) {
            listener = args[i];
            if (listener === listenable || listener.hasListener && listener.hasListener(listenable)) {
                return true;
            }
        }

        return false;
    };

    reset();

    for (var i = 0; i < numberOfListenables; i++) {
        arguments[i].listen(newListener(i), null);
    }

    return action;

    function reset() {
        listenablesEmitted = new Array(numberOfListenables);
        args = new Array(numberOfListenables);
    }

    function newListener(i) {
        return function() {
            listenablesEmitted[i] = true;
            // Reflux users should not need to care about Array and arguments
            // differences. This makes sure that they get the expected Array
            // interface
            args[i] = slice.call(arguments);
            emitWhenAllListenablesEmitted();
        };
    }

    function emitWhenAllListenablesEmitted() {
        if (didAllListenablesEmit()) {
            action.apply(action, args);
            reset();
        }
    }

    function didAllListenablesEmit() {
        // reduce cannot be used because it only iterates over *present*
        // elements in the array. Initially the Array doesn't contain
        // elements. For this reason the usage of reduce would always indicate
        // that all listenables emitted.
        for (var i = 0; i < numberOfListenables; i++) {
            if (!listenablesEmitted[i]) {
                return false;
            }
        }
        return true;
    }
};

},{"./createAction":3}],3:[function(_dereq_,module,exports){
var _ = _dereq_('./utils'),
    Reflux = _dereq_('../src'),
    keep = _dereq_('./keep');

/**
 * Creates an action functor object
 */
module.exports = function(definition) {

    definition = definition || {};

    var context = _.extend({
        eventLabel: "action",
        emitter: new _.EventEmitter()
    },definition,Reflux.publisherMethods,{
        preEmit: definition.preEmit || Reflux.publisherMethods.preEmit,
        shouldEmit: definition.shouldEmit || Reflux.publisherMethods.shouldEmit
    });

    var functor = function() {
        context.triggerAsync.apply(context,arguments);
    };

    _.extend(functor,context);

    keep.createdActions.push(functor);

    return functor;

};

},{"../src":5,"./keep":6,"./utils":11}],4:[function(_dereq_,module,exports){
var _ = _dereq_('./utils'),
    Reflux = _dereq_('../src'),
    keep = _dereq_('./keep');

/**
 * Creates an event emitting Data Store
 *
 * @param {Object} definition The data store object definition
 * @returns {Store} A data store instance
 */
module.exports = function(definition) {

    definition = definition || {};

    function Store() {
        var i=0, arr;
        this.subscriptions = [];
        this.emitter = new _.EventEmitter();
        this.eventLabel = "change";
        if (this.init && _.isFunction(this.init)) {
            this.init();
        }
        if (this.listenables){
            arr = [].concat(this.listenables);
            for(;i < arr.length;i++){
                this.listenToMany(arr[i]);
            }
        }
    }

    _.extend(Store.prototype, definition, Reflux.listenerMethods, Reflux.publisherMethods, {
        preEmit: definition.preEmit || Reflux.publisherMethods.preEmit,
        shouldEmit: definition.shouldEmit || Reflux.publisherMethods.shouldEmit
    });

    var store = new Store();
    keep.createdStores.push(store);

    return store;
};

},{"../src":5,"./keep":6,"./utils":11}],5:[function(_dereq_,module,exports){
exports.listenerMethods = _dereq_('./listenerMethods');

exports.publisherMethods = _dereq_('./publisherMethods');

exports.createAction = _dereq_('./createAction');

exports.createStore = _dereq_('./createStore');

exports.listenerMixin = exports.ListenerMixin = _dereq_('./listenerMixin');

exports.listenTo = _dereq_('./listenTo');

exports.all = _dereq_('./all');

exports.createActions = function(actionNames) {
    var i = 0, actions = {};
    for (; i < actionNames.length; i++) {
        actions[actionNames[i]] = exports.createAction();
    }
    return actions;
};

exports.setEventEmitter = function(ctx) {
    var _ = _dereq_('./utils');
    _.EventEmitter = ctx;
};

exports.nextTick = function(nextTick) {
    var _ = _dereq_('./utils');
    _.nextTick = nextTick;
};

exports.__keep = _dereq_('./keep');

},{"./all":2,"./createAction":3,"./createStore":4,"./keep":6,"./listenTo":7,"./listenerMethods":8,"./listenerMixin":9,"./publisherMethods":10,"./utils":11}],6:[function(_dereq_,module,exports){
exports.createdStores = [];

exports.createdActions = [];

exports.reset = function() {
    while(exports.createdStores.length) {
        exports.createdStores.pop();
    }
    while(exports.createdActions.length) {
        exports.createdActions.pop();
    }
};

},{}],7:[function(_dereq_,module,exports){
var Reflux = _dereq_('../src');


/**
 * A mixin factory for a React component. Meant as a more convenient way of using the `listenerMixin`,
 * without having to manually set listeners in the `componentDidMount` method.
 *
 * @param {Action|Store} listenable An Action or Store that should be
 *  listened to.
 * @param {Function|String} callback The callback to register as event handler
 * @param {Function|String} defaultCallback The callback to register as default handler
 * @returns {Object} An object to be used as a mixin, which sets up the listener for the given listenable.
 */
module.exports = function(listenable,callback,initial){
    return {
        /**
         * Set up the mixin before the initial rendering occurs. Import methods from `listenerMethods`
         * and then make the call to `listenTo` with the arguments provided to the factory function
         */
        componentDidMount: function() {
            for(var m in Reflux.listenerMethods){
                if (this[m] !== Reflux.listenerMethods[m]){
                    if (this[m]){
                        throw "Can't have other property '"+m+"' when using Reflux.listenTo!";
                    }
                    this[m] = Reflux.listenerMethods[m];
                }
            }
            this.listenTo(listenable,callback,initial);
        },
        /**
         * Cleans up all listener previously registered. 
         */
        componentWillUnmount: Reflux.listenerMethods.stopListeningToAll
    };
};

},{"../src":5}],8:[function(_dereq_,module,exports){
var _ = _dereq_('./utils');

/**
 * A module of methods related to listening. This module is consumed by `createStore`,
 * `listenerMixin` and the `listenTo` mixin factory.
 */
module.exports = {
	
    /**
     * An internal utility function used by `validateListening`
     *
     * @param {Action|Store} listenable The listenable we want to search for
     * @returns {Boolean} The result of a recursive search among `this.subscriptions`
     */
    hasListener: function(listenable) {
        var i = 0,
            listener;
        for (;i < (this.subscriptions||[]).length; ++i) {
            listener = this.subscriptions[i].listenable;
            if (listener === listenable || listener.hasListener && listener.hasListener(listenable)) {
                return true;
            }
        }
        return false;
    },

    /**
     * A convenience method that listens to all listenables in the given object.
     * 
     * @param {Object} listenables An object of listenables. Keys will be used as callback method names.
     */
    listenToMany: function(listenables){
        for(var key in listenables){
            var cbname = _.callbackName(key),
                localname = this[cbname] ? cbname : this[key] ? key : undefined;
            if (localname){
                this.listenTo(listenables[key],localname,this[cbname+"Default"]||this[localname+"Default"]||localname);
            }
        }
    },

    /**
     * Checks if the current context can listen to the supplied listenable
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @returns {String|Undefined} An error message, or undefined if there was no problem.
     */
    validateListening: function(listenable){
    	if (listenable === this) {
            return "Listener is not able to listen to itself";
        }
        if (!_.isFunction(listenable.listen)) {
            return listenable + " is missing a listen method";
        }
        if (this.hasListener(listenable)) {
            return "Listener cannot listen to this listenable because of circular loop";
        }
    },

    /**
     * Sets up a subscription to the given listenable for the context object
     *
     * @param {Action|Store} listenable An Action or Store that should be
     *  listened to.
     * @param {Function|String} callback The callback to register as event handler
     * @param {Function|String} defaultCallback The callback to register as default handler
     * @returns {Object} A subscription obj where `stop` is an unsub function and `listenable` is the object being listened to
     */
    listenTo: function(listenable, callback, defaultCallback) {
    	var err = this.validateListening(listenable),
            self = this;
    	if (err){
    		throw Error(err);
    	}
        this.fetchDefaultData(listenable, defaultCallback);
        if (!this.subscriptions) { this.subscriptions = [];}
        var desub = listenable.listen(this[callback]||callback, this),
            unsubscriber = function (dontupdatearr) {
                desub();
                if (!dontupdatearr) {
                    self.subscriptions.splice(self.subscriptions.indexOf(listenable), 1);
                }
            },
            subscriptionobj = {
                stop: unsubscriber,
                listenable: listenable
            };
        this.subscriptions.push(subscriptionobj);
        return subscriptionobj;
    },

    /**
     * Stops listening to a single listenable
     *
     * @param {Action|Store} listenable The action or store we no longer want to listen to
     * @param {Boolean} dontupdatearr If true, we don't remove the subscription object from this.subscriptions
     * @returns {Boolean} True if a subscription was found and removed, otherwise false.
     */
    stopListeningTo: function(listenable,dontupdatearr){
        for(var i=0; i<(this.subscriptions||[]).length;i++){
            if (this.subscriptions[i].listenable === listenable){
                this.subscriptions[i].stop(dontupdatearr);
                return true;
            }
        }
        return false;
    },

    /**
     * Stops all subscriptions and empties subscriptions array
     *
     */
    stopListeningToAll: function(){
        (this.subscriptions||[]).forEach(function(subscription) {
            subscription.stop(true);
        });
        this.subscriptions = [];
    },

    /**
     * Used in `listenTo`. Fetches initial data from a publisher if it has a `getDefaultData` method.
     * @param {Action|Store} listenable The publisher we want to get default data from
     * @param {Function|String} defaultCallback The method to receive the data
     */
    fetchDefaultData: function (listenable, defaultCallback) {
        defaultCallback = (defaultCallback && this[defaultCallback]) || defaultCallback;
        var me = this;
        if (_.isFunction(defaultCallback) && _.isFunction(listenable.getDefaultData)) {
            data = listenable.getDefaultData();
            if (data && _.isFunction(data.then)) {
                data.then(function() {
                    defaultCallback.apply(me, arguments);
                });
            } else {
                defaultCallback.call(this, data);
            }
        }
    }
};


},{"./utils":11}],9:[function(_dereq_,module,exports){
var _ = _dereq_('./utils'),
    Reflux = _dereq_('../src');

/**
 * A module meant to be consumed as a mixin by a React component. Supplies the methods from
 * `listenerMethods` and takes care of teardown of subscriptions.
 */
module.exports = _.extend({

    /**
     * By adding this in the mixin we get error message if other React mixins try to use the same prop
     */
    subscriptions: [],

    /**
     * Cleans up all listener previously registered. 
     */
    componentWillUnmount: Reflux.listenerMethods.stopListeningToAll

},Reflux.listenerMethods);

},{"../src":5,"./utils":11}],10:[function(_dereq_,module,exports){
var _ = _dereq_('./utils');

/**
 * A module of methods for object that you want to be able to listen to.
 * This module is consumed by `createStore` and `createAction`
 */
module.exports = {

    /**
     * Hook used by the publisher that is invoked before emitting
     * and before `shouldEmit`. The arguments are the ones that the action
     * is invoked with.
     */
    preEmit: function() {},

    /**
     * Hook used by the publisher after `preEmit` to determine if the
     * event should be emitted with given arguments. This may be overridden
     * in your application, default implementation always returns true.
     *
     * @returns {Boolean} true if event should be emitted
     */
    shouldEmit: function() { return true; },

    /**
     * Subscribes the given callback for action triggered
     *
     * @param {Function} callback The callback to register as event handler
     * @param {Mixed} [optional] bindContext The context to bind the callback with
     * @returns {Function} Callback that unsubscribes the registered event handler
     */
    listen: function(callback, bindContext) {
        var eventHandler = function(args) {
            callback.apply(bindContext, args);
        }, me = this;
        this.emitter.addListener(this.eventLabel, eventHandler);
        return function() {
            me.emitter.removeListener(me.eventLabel, eventHandler);
        };
    },

    /**
     * Publishes an event using `this.emitter` (if `shouldEmit` agrees)
     */
    trigger: function() {
        var args = arguments;
        this.preEmit.apply(this, args);
        if (this.shouldEmit.apply(this, args)) {
            this.emitter.emit(this.eventLabel, args);
        }
    },

    /**
     * Tries to publish the event on the next tick
     */
    triggerAsync: function(){
        var args = arguments,me = this;
        _.nextTick(function() {
            me.trigger.apply(me, args);
        });
    }
};

},{"./utils":11}],11:[function(_dereq_,module,exports){
/*
 * isObject, extend, isFunction, and bind are taken from undescore/lodash in
 * order to remove the dependency
 */

var isObject = exports.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

exports.extend = function(obj) {
    if (!isObject(obj)) {
        return obj;
    }
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
        source = arguments[i];
        for (prop in source) {
            obj[prop] = source[prop];
        }
    }
    return obj;
};

exports.isFunction = function(value) {
    return typeof value === 'function';
};

exports.EventEmitter = _dereq_('eventemitter3');

exports.nextTick = function(callback) {
    setTimeout(callback, 0);
};

exports.callbackName = function(string){
    return "on"+string.charAt(0).toUpperCase()+string.slice(1);
};

},{"eventemitter3":1}]},{},[5])
(5)
});