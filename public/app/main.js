define([
    'bootstrap',
    'knockout',
    './canvas',
    './simulation',
    './cache',
    './worker'
], function (bootstrap, ko, Canvas, Simulation, Cache, Worker) {
    var worker = new Worker();
    var settings = {
        damping: ko.observable(0.5),
        attraction: ko.observable(0.01),
        repulsion: ko.observable(10),
        displacement: ko.observable(0),
        updateLayout: ko.observable(true)
    };
    var app = {
        worker: worker,
        settings: settings,
        canvas: new Canvas(worker, settings),
        simulation: new Simulation(worker, settings),
        cache: new Cache(worker),
        search: ko.observable(),
        doSearch: function () {
            var item;
            if (this.search().match(/https?:\/\/bandcamp\.com\/.*/i)) {
                item = this.cache.createUser(this.canvas, this.simulation, this.search());
            } else {
                item = this.cache.createAlbum(this.canvas, this.simulation, this.search());
            }
            item.bound = true;
            item.load();
            this.canvas.clear();
            this.canvas.add(item);
            this.simulation.add(item);
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
