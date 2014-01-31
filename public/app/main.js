define([
    'bootstrap',
    'knockout',
    './canvas',
    './user'
], function (bootstrap, ko, Canvas, User) {
    var app = {
        canvas: new Canvas(),
        search: ko.observable(),

        doSearch: function () {
            var user = new User(this.search(), this.canvas);
            user.moveNear({ x: 700, y: 300 });
            this.canvas.clear();
            this.canvas.addUsers([user]);
            user.load();
        }
    };

    $(window).on('mousewheel', _.bind(app.canvas.onMouseWheel, app.canvas));
    ko.applyBindings(app);
});
