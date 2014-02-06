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
                user.bound = true;
                this.canvas.clear();
                this.canvas.addUsers([user]);
                user.load();
            } else {
                var album = this.cache.createAlbum(this.canvas, this.search());
                album.bound = true;
                this.canvas.clear();
                this.canvas.addAlbums([album]);
                album.load();
            }
            this.canvas.panTo(0, 0);
        }
    };

    app.canvas.setSize($(window).width(), $(window).height() - $('#navbar').height());

    $(window).on('resize', function (event) {
        app.canvas.setSize($(window).width(), $(window).height() - $('#navbar').height());
    });

    $(window).on('mousewheel', function (event) {
        app.canvas.panBy(event.originalEvent.deltaX, event.originalEvent.deltaY);
        event.preventDefault();
    });

    ko.applyBindings(app);
});
