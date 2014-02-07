define([
    'bootstrap',
    'knockout',
    './canvas',
    './cache',
    './worker'
], function (bootstrap, ko, Canvas, Cache, Worker) {
    var worker = new Worker();
    var app = {
        worker: worker,
        canvas: new Canvas(worker),
        cache: new Cache(worker),
        search: ko.observable(),

        doSearch: function () {
            var item;
            if (this.search().match(/https?:\/\/bandcamp\.com\/.*/i)) {
                item = this.cache.createUser(this.canvas, this.search());
            } else {
                item = this.cache.createAlbum(this.canvas, this.search());
            }
            item.bound = true;
            item.load();
            this.canvas.clear();
            this.canvas.add(item);
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
