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
            return this.title() + ' by ' + this.artist();
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

    Album.prototype.render = function (ctx) {
        ctx.fillStyle = 'rgb(0, 200, 0)';
        ctx.fillRect(this.pos.x - (this.width / 2), this.pos.y - (this.height / 2), this.width, this.height);
      /* TODO:
        <a data-bind='click: load, if: !loaded() && !loading() && errored(), attr: { title: error }' href='#'>
          <i class='fa fa-exclamation-triangle'></i>
        </a>
        <span data-bind='if: !loaded() && !errored()'>
          <i class='fa fa-spin fa-spinner'></i>
        </span>
        <span data-bind='if: loaded, attr: { title: header }'>
          <span class='fa' data-bind='css: iconClass'></span>
        </a>
      */
    };

    Album.prototype.width = 20;
    Album.prototype.height = 20;
    Album.prototype.type = 'album';
    Album.prototype.relatedType = 'fan';
    Album.prototype.relatedRelatedType = 'album';
    Album.prototype.iconClass = 'fa-headphones';
    Album.prototype.loader = new Loader('album', new AlbumScraper());

    return Album;
});
