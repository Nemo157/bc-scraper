define([
    'knockout',
    'jStorage',
    './canvas',
    './simulation',
    './cache',
    './worker',
    './settings'
], function (ko, jStorage, Canvas, Simulation, Cache, Worker, Settings) {
    var settings = new Settings('settings', {
        damping: 0.5,
        attraction: 0.01,
        repulsion: 10,
        displacement: 0,
        updateLayout: true,
        runSimulation: true,
    });
    var stats = new Settings('stats', {
        entities: 0,
        processedLastFrame: 0,
        remainingItems: 0,
        layoutTime: 0,
        simulationTime: 0,
    });
    settings.load();

    var worker = new Worker(stats);

    var app = {
        worker: worker,
        settings: settings,
        stats: stats,
        canvas: new Canvas(settings, stats),
        simulation: new Simulation(settings, stats),
        cache: new Cache(worker),
        search: ko.observable(),
        clicked: ko.observable(),
        mouseOvered: ko.observable(),
        saved: ko.observable(),
        doSearch: function () {
            var item;
            if (this.search().match(/https?:\/\/bandcamp\.com\/.*/i)) {
                item = this.cache.createUser(this.canvas, this.simulation, this.search());
            } else {
                item = this.cache.createAlbum(this.canvas, this.simulation, this.search());
            }
            item.locked(true);
            item.bound = true;
            item.load();
            this.canvas.clear();
            this.simulation.clear();
            this.canvas.add(item);
            this.simulation.add(item);
            this.canvas.panTo(0, 0);
            jStorage.set('bc-last-url', this.search());
        },
        save: function () {
            var state = {
              root: this.simulation.items[0].uri,
              items: this.simulation.items.map(item => ({ type: item.type, uri: item.uri, pos: item.pos, bound: item.bound })),
            }
            jStorage.set('bc-saved-state', state);
            this.saved(state);
        },
        load: function () {
            this.canvas.clear();
            this.simulation.clear();
            this.canvas.panTo(0, 0);
            var items = this.saved().items;
            var root = this.saved().root;
            var expandItem = function (details) {
                var item;
                if (details.type === 'user') {
                    item = this.cache.createUser(this.canvas, this.simulation, details.uri);
                } else {
                    item = this.cache.createAlbum(this.canvas, this.simulation, details.uri);
                }
                if (!item.displayed()) {
                    item.last_pos.x = item.pos.x = details.pos.x;
                    item.last_pos.y = item.pos.y = details.pos.y;
                    this.canvas.add(item);
                    this.simulation.add(item);
                    item.load();
                    item.bound = details.bound;
                }
            };
            for (var i = 0; i < items.length; i++) {
                this.worker.enqueue(_.bind(expandItem, this, items[i]), 1);
            }
        }
    };

    app.selection = ko.computed(() => app.clicked() || app.mouseOvered());

    app.savedDescription = ko.computed(() => {
      if (app.saved()) {
        return `${app.saved().items.length} entities from ${app.saved().root}`;
      } else {
        return 'No save yet';
      }
    });

    app.canvas.setSize($('#canvas').width(), $('#canvas').height());

    $(window).on('resize', function (event) {
        app.canvas.setSize($('#canvas').width(), $('#canvas').height());
    });

    $(window).on('mousewheel', function (event) {
        app.canvas.panBy(event.originalEvent.deltaX, event.originalEvent.deltaY);
        event.preventDefault();
    });

    app.onItemClick = function (item, event) {
        app.clicked(item);
    };

    app.onCanvasClick = function () {
        app.clicked(null);
    };

    app.onItemMouseOver = function (item) {
        app.mouseOvered(item);
    };

    var lastY;
    $(window).on('touchmove', function (event) {
        event.preventDefault();
    });
    $('#panel').on('touchstart', function (event) {
        lastY = event.originalEvent.touches[0].pageY;
    });
    $('#panel').on('touchmove', function (event) {
        event.currentTarget.scrollTop += (lastY - event.originalEvent.touches[0].pageY);
        lastY = event.originalEvent.touches[0].pageY;
    });

    ko.applyBindings(app);

    app.search(jStorage.get('bc-last-url'));
    app.saved(jStorage.get('bc-saved-state'));

    return app;
});
