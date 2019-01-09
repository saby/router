define([
   'Router/Registrar'
], function(Registrar) {
   Registrar = Registrar.default;
   var registrarObj = null;
   var cmp1 = {
      getInstanceId: function() {
         return 1;
      },
      callback: function(newObj, oldObj) {
         newObj.a += 1;
         return new Promise(function(resolve) {
            oldObj.a += 3;
            resolve(true);
         });

      }
   }, cmp2 = {
      getInstanceId: function(){
         return 2;
      },
      callback: function(newObj, oldObj) {
         newObj.a += 4;
         return new Promise(function(resolve) {
            oldObj.a += 6;
            resolve(false);
         });
      }
   };
   describe('Router/Registrar', function() {
      beforeEach(function() {
         registrarObj = new Registrar();
      });
      it('register and async callback', function(done) {

         registrarObj.register({stopPropagation: function() {}}, cmp1, cmp1.callback);
         registrarObj.register({stopPropagation: function() {}}, cmp2, cmp2.callback);
         var obj1 = {a:0},
            obj2 = {a:0};
         registrarObj.startAsync(obj1, obj2).then(function(results) {
            assert.equal(results[0], true);
            assert.equal(results[1], false);
            assert.equal(obj1.a, 5);
            assert.equal(obj2.a, 9);
            done();
         }).catch(function(e) {
            done(e);
         })
      });
   });
});
