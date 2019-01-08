define('RouterDemo/Main', [
   'Core/Control',
   'wml!RouterDemo/Main'
], function(Control, template) {

   var Main = Control.extend({
      _template: template
   });
   return Main;
});
