define([
    'knockout',
    'jquery',
    'lodash'
], function (ko, $, _) {
    function Item(uri, cache, canvas) {
        this.cache = cache;
        this.canvas = canvas;
        this.uri = ko.observable(uri);
        this.loaded = ko.observable(false);
        this.loading = ko.observable(false);
        this.errored = ko.observable(false);
        this.displayed = ko.observable(false);
        this.pos = { x: 0, y: 0 };
        this.last_pos = { x: 0, y: 0 };
        this.force = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.position = ko.observable(this.pos);
    }

    Item.prototype.load = function () {
        if (!this.loaded() && !this.loading()) {
            this.loading(true);
            $.getJSON('/' + this.getType() + 's/' + this.uri().replace(/^https?:\/\//, ''))
             .done(_.bind(this.onLoaded, this))
             .fail(_.bind(this.onError, this));
         }
    };

    Item.prototype.onLoaded = function (data) {
        this.loading(false);
        this.loaded(true);
        if (this.uri() !== data.uri) {
            this.cache.updateUri(this, this.uri(), data.uri);
            this.uri(data.uri);
        }
    };

    Item.prototype.onError = function () {
        this.loading(false);
        this.errored(true);
    };

    Item.prototype.moveNear = function (pos) {
        this.last_pos.x = this.pos.x = Math.random() * 100 - 50 + pos.x;
        this.last_pos.y = this.pos.y = Math.random() * 100 - 50 + pos.y;
    };

    return Item;
});
