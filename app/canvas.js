define([
    'knockout',
    'jquery',
    'lodash'
], function (ko, $, _) {
    function Canvas(worker, settings) {
        this.worker = worker;
        this.settings = settings;
        this.width = ko.observable(0);
        this.height = ko.observable(0);
        this.users = ko.observableArray();
        this.albums = ko.observableArray();
        this.items = ko.computed(_.bind(function () {
            return [].concat(this.users()).concat(this.albums());
        }, this));
        this.left = ko.observable(0);
        this.top = ko.observable(0);

        this.worker.addRepeating(_.bind(function () {
            if (this.settings.updateLayout()) {
                this.relayout();
            }
        }, this));

        this.onMouseDown = _.bind(function (item) {
            this.onMouseUp();
            item.onMouseDown();
            this.currentHeldItem = item;
        }, this);

        this.onMouseUp = _.bind(function (item) {
            if (this.currentHeldItem) {
                this.currentHeldItem.onMouseUp();
                this.currentHeldItem = null;
            }
        }, this);

        this.onMouseMove = _.bind(function (data, event) {
            if (this.currentHeldItem) {
                this.currentHeldItem.onMouseMove(this.currentHeldItem, event, this.left(), this.top());
            }
        }, this);
    }

    Canvas.prototype.clear = function () {
        _.forEach(this.items(), function (item) { item.displayed(false); }, this);
        this.users.removeAll();
        this.albums.removeAll();
    };

    Canvas.prototype.add = function (item) {
        if (item.type === 'user') {
            item.displayed(true);
            this.users.push(item);
        } else if (item.type === 'album') {
            item.displayed(true);
            this.albums.push(item);
        }
    };

    Canvas.prototype.relayout = function () {
        var items = this.items();

        var displacement = 0;
        var localDisplacement = 0;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            localDisplacement = Math.abs(item.pos.x - item.x()) + Math.abs(item.pos.y - item.y());
            if (localDisplacement > 0.5) {
                displacement += localDisplacement;
                item.x(item.pos.x);
                item.y(item.pos.y);
            }
        }

        this.settings.displacement(displacement);
    };

    Canvas.prototype.setSize = function (width, height) {
        this.panBy((this.width() - width) / 2, (this.height() - height) / 2);
        this.width(width);
        this.height(height);
    };

    Canvas.prototype.panBy = function (deltaX, deltaY) {
        this.left(this.left() - deltaX);
        this.top(this.top() - deltaY);
    };

    Canvas.prototype.panTo = function (x, y) {
        this.left(this.width() / 2 - x);
        this.top(this.height() / 2 - y);
    };

    return Canvas;
});
