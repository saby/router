define('RouterTest/resources/routerCustom', function () {
   return {
      '/regex:^([0-9]{5})$': 'SomeModule/$1',
      '/a/b/c': 'ab',
      '/my-page': 'MyModule/my-page'
   };
});
