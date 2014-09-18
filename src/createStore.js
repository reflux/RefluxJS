var _ = require('./utils'),
    Reflux = require('../src'),
    keep = require('./keep');

/**
 * Creates an event emitting Data Store. It is mixed in with functions
 * from the `listenerMethods` and `listenableMethods` mixins. `preEmit`
 * and `shouldEmit` may be overridden in the definition object.
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

    _.extend(Store.prototype, definition, Reflux.listenerMethods, Reflux.listenableMethods,{
        preEmit: definition.preEmit || Reflux.listenableMethods.preEmit,
        shouldEmit: definition.shouldEmit || Reflux.listenableMethods.shouldEmit
    });

    var store = new Store();

    keep.createdStores.push(store);

    return store;
};
