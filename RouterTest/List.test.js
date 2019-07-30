/* global assert, sinon */
define(['Router/router'],/**
* @param { import('../Router/router') } Router
*/
function(Router) {
   var List = Router.List;

   describe('Router/List', function() {

      var l, options;

      before(function() {
         sinon.stub(Router.Controller, 'navigate');
      });

      beforeEach(function() {
         options = {
            state: 'state/:id',
            href: 'href/:id',
            itemKeyProperty: 'keyProperty'
         };
         l = new List(options);
         l._beforeMount(options);
         l.saveOptions(options);
         l._notify = sinon.stub();
      });

      afterEach(function() {
         Router.Controller.navigate.reset();
      })

      after(function() {
         l = null;
         options = null;
         Router.Controller.navigate.restore();
      });

      it('calculates new url based on masks and record', function() {
         var fakeRecord = {};
         fakeRecord[options.itemKeyProperty] = 'replacement';

         l._itemClickHandler(null, fakeRecord);

         var
            navCall = Router.Controller.navigate.getCall(0),
            state = navCall.args[0].state,
            href = navCall.args[0].href;

         assert.include(state, '/' + options.state.replace(':id', 'replacement'));
         assert.include(href, '/' + options.href.replace(':id', 'replacement'));
      });

      it('uses property name from itemKeyProperty', function() {
         options.itemKeyProperty = 'someOtherProperty';
         var fakeRecord = {
            keyProperty: 'doNotUseThis'
         };
         fakeRecord[options.itemKeyProperty] = 'yes';

         l._itemClickHandler(null, fakeRecord);

         var
            navCall = Router.Controller.navigate.getCall(0),
            state = navCall.args[0].state,
            href = navCall.args[0].href;

         assert.include(state, '/' + options.state.replace(':id', 'yes'));
         assert.include(href, '/' + options.href.replace(':id', 'yes'));
      });

      it('fires navigate event with new state', function() {
         var
            fakeRecord = {},
            fakeClickEvent = { click: true };

         fakeRecord[options.itemKeyProperty] = '123';

         l._itemClickHandler(null, fakeRecord, fakeClickEvent);

         var notifyCall = l._notify.getCall(0);

         assert.isOk(notifyCall);
         assert.strictEqual(notifyCall.args[0], 'navigate');
         assert.lengthOf(notifyCall.args[1], 3); // new state, click event, record

         var navCall = Router.Controller.navigate.getCall(0);

         assert.deepEqual(notifyCall.args[1][0], navCall.args[0]);
         assert.strictEqual(notifyCall.args[1][1], fakeClickEvent);
         assert.strictEqual(notifyCall.args[1][2], fakeRecord);
      });

      it('prevents navigation if navigate handler returns false', function() {
         var fakeRecord = {};
         fakeRecord[options.itemKeyProperty] = '123';
         l._notify.returns(false);

         l._itemClickHandler(null, fakeRecord);

         assert.isTrue(l._notify.called);
         assert.isFalse(Router.Controller.navigate.called);
      });

      it('does not handle itemClick if click was handled by Reference', function() {
         var clickEvent = { routerReferenceNavigation: true };

         l._itemClickHandler(null, null, clickEvent);

         assert.isFalse(l._notify.called);
         assert.isFalse(Router.Controller.navigate.called);
      });

      it('can use complex itemKeyProperty name with slash dividers', function() {
         var fakeRecord = {
            'key1': {
               'key2': [
                  null,
                  { 'key3': 'inner' }
               ]
            }
         };
         options.itemKeyProperty = 'key1/key2/1/key3';
         l.saveOptions(options);

         l._itemClickHandler(null, fakeRecord);

         var
            navCall = Router.Controller.navigate.getCall(0),
            state = navCall.args[0].state,
            href = navCall.args[0].href;

         assert.include(state, '/' + options.state.replace(':id', 'inner'));
         assert.include(href, '/' + options.href.replace(':id', 'inner'));
      });

      it('can work with getter objects (like records)', function() {
         var fakeRecord = {
            get: function(name) {
               if (name === options.itemKeyProperty) {
                  return 'correct';
               }
               return 'wrong';
            }
         };

         l._itemClickHandler(null, fakeRecord);

         var
            navCall = Router.Controller.navigate.getCall(0),
            state = navCall.args[0].state,
            href = navCall.args[0].href;

         assert.include(state, '/' + options.state.replace(':id', 'correct'));
         assert.include(href, '/' + options.href.replace(':id', 'correct'));
      });

      it('does not fail with wrong path', function() {
         var fakeRecord = {
            'Parent': {
               'ExistingChild': 'success'
            }
         };
         options.itemKeyProperty = 'Parent/NonexistingChild';
         l.saveOptions(options);

         assert.doesNotThrow(l._itemClickHandler.bind(l, null, fakeRecord));
      });

   });
});
