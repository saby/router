define('RouterTest/resources/controlManager', ['Core/Control'], function(CoreControl) {
   return {
      createControl: function(ControlClass, options) {
         function overlayLiveCycle(control, functionName){
            return new Promise((res,rej) =>{
               // stores initial "control.functionName"
               var protoFunc = control[functionName] && control[functionName].bind(control);
               const REJECTION_TIME = 20000;
               // assigns initial "control.functionName" in control
               function revert() {
                  control[functionName] = protoFunc;
                  protoFunc = null;
               }
               // reject promise on timeout
               var timer = setTimeout(() => {
                  revert();
                  rej();
               }, REJECTION_TIME);
               // overlays "control.functionName" to resolve promise on "control.functionName" call;
               control[functionName] = (function(...args) {
                  protoFunc && typeof protoFunc === 'function' && protoFunc(...args);
                  revert();
                  clearTimeout(timer);
                  res();
               }).bind(control);
            });
         }
         var element = document.createElement('div');
         element.className = 'router-tests-control';

         var control = CoreControl.createControl(ControlClass, Object.assign({}, options), element);
         control._$testElement = element;
         control.mounting = overlayLiveCycle(control,'_afterMount');
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
