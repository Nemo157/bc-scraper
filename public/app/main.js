define([
    'bootstrap',
    'knockout',
    './canvas',
    './cache'
], function (bootstrap, ko, Canvas, Cache) {
    var app = {
        canvas: new Canvas(),
        cache: new Cache(),
        search: ko.observable(),

        doSearch: function () {
            if (this.search().match(/https?:\/\/bandcamp\.com\/.*/i)) {
                var user = this.cache.createUser(this.canvas, this.search());
                user.moveNear({ x: 700, y: 300 });
                user.bound = true;
                this.canvas.clear();
                this.canvas.addUsers([user]);
                user.load();
            } else {
                var album = this.cache.createAlbum(this.canvas, this.search());
                album.moveNear({ x: 700, y: 300 });
                album.bound = true;
                this.canvas.clear();
                this.canvas.addAlbums([album]);
                album.load();
            }
        }
    };

    $(window).on('mousewheel', _.bind(app.canvas.onMouseWheel, app.canvas));
    ko.applyBindings(app);
});
