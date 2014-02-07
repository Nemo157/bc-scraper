define([
    'knockout',
    'jquery',
    'lodash'
], function (ko, $, _) {
    function Item() {
    }

    Item.prototype.init = function (uri, cache, worker, canvas) {
        this.cache = cache;
        this.worker = worker;
        this.canvas = canvas;
        this.uri = ko.observable(uri);
        this.loaded = ko.observable(false);
        this.loading = ko.observable(false);
        this.errored = ko.observable(false);
        this.displayed = ko.observable(false);
        this.expanding = ko.observable(false);
        this.pos = { x: 0, y: 0 };
        this.last_pos = { x: 0, y: 0 };
        this.force = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.x = ko.observable(0);
        this.y = ko.observable(0);
        this.header = ko.computed(function () {
            return this.loaded() ?  this.headerText() : "Loading...";
        }, this);
        this.relatedClass = ko.computed(function () {
            if (this.related().length > 20) {
                return 'glyphicon-th';
            } else {
                return 'glyphicon-th-large';
            }
        }, this);
        this.relatedDisplayed = this.related.filter(function (item) { return item.displayed(); });
        this.relatedUndisplayed = this.related.filter(function (item) { return !item.displayed(); });
        this.relatedTypePluralized = ko.computed(function () {
            return this.relatedType + (this.relatedUndisplayed().length > 1 ? 's' : '');
        }, this);
    };

    Item.prototype.load = function () {
        if (!this.loaded() && !this.loading()) {
            this.errored(false);
            this.loading(true);
            $.getJSON('/' + this.type + 's/' + this.uri().replace(/^https?:\/\//, ''))
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

    Item.prototype.expand = function () {
        this.expanding(true);
        var loadItem = _.bind(function (items, i) {
            if (i < items.length) {
                if (!items[i].displayed()) {
                    items[i].moveNear(this.pos);
                    items[i].load();
                }
                this.worker.enqueue(loadItem, items, i + 1);
            } else {
                this.canvas.add(this.related());
                this.expanding(false);
            }
        }, this);
        this.worker.enqueue(loadItem, this.related(), 0);
    };

    Item.prototype.moveNear = function (pos) {
        this.x(this.last_pos.x = this.pos.x = Math.random() * 100 - 50 + pos.x);
        this.y(this.last_pos.y = this.pos.y = Math.random() * 100 - 50 + pos.y);
    };

    return Item;
});
