define([
    'knockout',
    'lodash',
    './item',
    './loader',
    './album_scraper'
], function (ko, _, Item, Loader, AlbumScraper) {
    function Album(uri, cache, worker, canvas, simulation) {
        this.init(uri, cache, worker, canvas, simulation);
    }

    Album.prototype = new Item();
    Album.prototype.constructor = Album;

    Album.prototype.init = function (uri, cache, worker, canvas, simulation) {
        this.artist = ko.observable();
        this.title = ko.observable();
        this.fanIds = ko.observableArray();
        this.fans = this.fanIds.map(_.bind(cache.createUser, cache, canvas, simulation));
        this.related = this.fans.map(_.identity);
        this.headerText = ko.computed(function () {
            return _.escape(this.artist()) + '<br>' + _.escape(this.title());
        }, this);
        Item.prototype.init.call(this, uri, cache, worker, canvas, simulation);
    };

    Album.prototype.onLoaded = function (data) {
        this.artist(data.artist);
        this.title(data.title);
        for (var i = 0; i < data.fans.length; i++) {
            this.worker.enqueue(_.bind(this.fanIds.push, this.fanIds, data.fans[i]));
        }
        this.worker.enqueue(_.bind(Item.prototype.onLoaded, this, data));
    };

    Album.prototype.type = 'album';
    Album.prototype.relatedType = 'fan';
    Album.prototype.iconClass = 'glyphicon-headphones';
    Album.prototype.loader = new Loader('album', new AlbumScraper());

    return Album;
});
