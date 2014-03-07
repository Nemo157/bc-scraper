define([
    'bootstrap',
    'knockout',
    './canvas',
    './simulation',
    './cache',
    './worker',
    './settings'
], function (bootstrap, ko, Canvas, Simulation, Cache, Worker, Settings) {
    var settings = new Settings('settings', {
        damping: 0.5,
        attraction: 0.01,
        repulsion: 10,
        displacement: 0,
        segmentSize: 100,
        updateLayout: true,
        runSimulation: true
    });
    var stats = new Settings('stats', {
        entities: 0,
        segments: 0,
        averagePerSegment: 0,
        processedLastFrame: 0,
        remainingItems: 0
    });
    settings.load();

    var worker = new Worker(stats);

    var app = {
        worker: worker,
        settings: settings,
        stats: stats,
        canvas: new Canvas(worker, settings),
        simulation: new Simulation(worker, settings, stats),
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
            this.simulation.clear();
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

    return app;
});
