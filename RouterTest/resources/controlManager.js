define('RouterTest/resources/controlManager', ['Core/Control'], function(CoreControl) {
   return {
      createControl: function(ControlClass, options) {
         var element = document.createElement('div');
         element.className = 'router-tests-control';

         var control = CoreControl.createControl(ControlClass, Object.assign({}, options), element);
         control._$testElement = element;
         control.createPromise=new Promise(function(res,res){
            const protoFunc=control._afterMount.bind(control);
            var resolved=false;
            var timer=setTimeout(()=>{
               if (!resolved){
                  resolved=true;
                  rej();
               }
            },20000);
            control._afterMount=(function(...args){
               if(protoFunc && typeof protoFunc === 'function'){
                  protoFunc(...args);
               }
               if (!resolved){
                  resolved=true;
                  clearTimeout(timer);
                  res();
               }
            }).bind(control);
         })
         

         return control;
      },
      destroyControl: function(control) {
         control.destroy();
         control._$testElement.remove();
         delete control._$testElement;
      },
      waitForLifecycle: function(timeout) {
         return new Promise(function(resolve) {
            setTimeout(resolve, timeout || 100);
         });
      }
   };
});
