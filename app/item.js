define([
    'knockout',
    'jquery',
    'lodash'
], function (ko, $, _) {
    function Item() {
    }

    Item.prototype.init = function (uri, cache, worker, canvas, simulation) {
        this.cache = cache;
        this.worker = worker;
        this.canvas = canvas;
        this.simulation = simulation;
        this.uri = uri;
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
        this.mouseOver = ko.observable();
        this.mouseDown = ko.observable();
        this.header = ko.computed(function () {
            return this.loaded()
              ? this.headerText()
              : this.errored()
              ? "Errored"
              : "Loading...";
        }, this);
        this.relatedClass = ko.computed(function () {
            if (this.related().length > 20) {
                return 'fa-th';
            } else {
                return 'fa-th-large';
            }
        }, this);
        this.relatedDisplayed = this.related.filter(function (item) { return item.displayed(); });
        this.relatedUndisplayed = this.related.filter(function (item) { return !item.displayed(); });
        this.relatedTypePluralized = ko.computed(function () {
            return this.relatedType + (this.relatedUndisplayed().length > 1 ? 's' : '');
        }, this);
        this.error = ko.observable();
    };

    Item.prototype.load = function () {
        if (!this.loaded() && !this.loading()) {
            this.errored(false);
            this.loading(true);
            this.loader.get(this.uri)
             .then(_.bind(this.onLoaded, this), _.bind(this.onError, this));
         }
    };

    Item.prototype.onLoaded = function (data) {
        this.loading(false);
        this.loaded(true);
    };

    Item.prototype.onError = function (err) {
        console.log("Error loading item:", this.uri, err);
        this.loading(false);
        this.errored(true);
        this.error(err.toString());
    };

    Item.prototype.expand = function () {
        this.expanding(true);
        var items = this.related();
        var expandItem = function (item) {
            if (!item.displayed()) {
                item.moveNear(this.pos);
                this.canvas.add(item);
                this.simulation.add(item);
                item.load();
            }
        };
        for (var i = 0; i < items.length; i++) {
            this.worker.enqueue(_.bind(expandItem, this, items[i]), 1);
        }
        this.worker.enqueue(_.bind(this.expanding, this, false), 1);
    };

    Item.prototype.moveNear = function (pos) {
        this.x(this.last_pos.x = this.pos.x = Math.random() * 100 - 50 + pos.x);
        this.y(this.last_pos.y = this.pos.y = Math.random() * 100 - 50 + pos.y);
    };

    Item.prototype.onMouseOver = function () {
        if (!this.mouseOver()) {
            this.originalBound = this.bound;
            this.bound = true;
            this.mouseOver(true);
        }
    };

    Item.prototype.onMouseOut = function () {
        if (this.mouseOver() && !this.mouseDown()) {
            this.bound = this.originalBound;
            this.mouseOver(false);
        }
    };

    Item.prototype.onMouseDown = function () {
        this.mouseDown(true);
    };

    Item.prototype.onMouseUp = function () {
        this.mouseDown(false);
    };

    Item.prototype.onMouseMove = function (data, event, canvasLeft, canvasTop) {
        if (this.mouseDown()) {
            this.x(this.last_pos.x = this.pos.x = event.pageX - canvasLeft - 8);
            this.y(this.last_pos.y = this.pos.y = event.pageY - canvasTop - 24);
        }
    };

    return Item;
});
