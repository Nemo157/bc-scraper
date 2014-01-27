define([
    'fabric',
    './item',
    './canvas'
], function (fabric, Item, canvas) {
    return fabric.util.createClass(Item, {
        loaded: function (data) {
            this.callSuper('loaded', data);
            this.object.item(1).setText(data.name);
            canvas.canvas.renderAll();
        },
        getType: function () {
            return 'users';
        }
    });
});
