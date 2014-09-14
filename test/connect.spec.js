var assert = require('chai').assert,
    sinon = require('sinon'),
    connect = require('../src/connect'),
    _ = require('../src/utils'),
    Reflux = require('../src');

describe('the connect module',function(){
    describe("when calling without key",function(){
        var defaultdata = "DATA",
            triggerdata = "DATA",
            listenable = {
                listen: sinon.spy(),
                getDefaultData: sinon.stub().returns(defaultdata)
            },
            context = {setState: sinon.spy()},
            result = _.extend(context,connect(listenable));
        it("should add componentDidMount and WillUnmount",function(){
            assert.isFunction(context.componentDidMount);
            assert.isFunction(context.componentWillUnmount);
            assert.equal(context.componentWillUnmount,Reflux.listenerMethods.stopListeningToAll);
        });
        result.componentDidMount();
        it("should call listen on the listenable correctly",function(){
            assert.equal(1,listenable.listen.callCount);
            assert.equal(context.setState,listenable.listen.firstCall.args[0]);
            assert.equal(context,listenable.listen.firstCall.args[1]);
        });
        it("should pass default data to state",function(){
            assert.deepEqual([defaultdata],context.setState.firstCall.args);
        });
        it("should store the subscription object correctly",function(){
            assert.equal(listenable,context.subscriptions[0].listenable);
        });
    });
    describe("when calling with key",function(){
        var defaultdata = "DATA",
            triggerdata = "DATA",
            key = "KEY",
            listenable = {
                listen: sinon.spy(),
                getDefaultData: sinon.stub().returns(defaultdata)
            },
            context = {setState: sinon.spy()},
            result = _.extend(context,connect(listenable,key));
        result.componentDidMount();
        it("should call listen on the listenable correctly",function(){
            assert.equal(1,listenable.listen.callCount);
            assert.isFunction(listenable.listen.firstCall.args[0]);
            assert.equal(context,listenable.listen.firstCall.args[1]);
        });
        it("should pass default data to state correctly",function(){
            assert.deepEqual([{KEY:defaultdata}],context.setState.firstCall.args);
        });
        it("should send listenable callback which calls setState correctly",function(){
            listenable.listen.firstCall.args[0](triggerdata);
            assert.deepEqual([_.object([key],[triggerdata])],context.setState.secondCall.args);
        });
    });
});
