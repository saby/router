define('RouterTest/resources/controlManager', ['Core/Control'], function(CoreControl) {
   return {
      createControl: function(ControlClass, options) {
         var element = document.createElement('div');
         element.className = 'router-tests-control';

         var control = CoreControl.createControl(ControlClass, Object.assign({}, options), element);
         control._$testElement = element;
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