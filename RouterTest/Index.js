define('RouterTest/Index',
    ['UI/Base', 'wml!RouterTest/resources/Index'],
function (UIBase, template) {
    return UIBase.Control.extend({
        _template: template,
    });
});
