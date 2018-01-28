define([
    'knockout',
    'jquery',
    'lodash'
], function (ko, $, _) {
    function Canvas(settings, stats) {
        this.settings = settings;
        this.stats = stats;
        this.width = ko.observable(0);
        this.height = ko.observable(0);
        this.users = ko.observableArray();
        this.albums = ko.observableArray();
        this.items = ko.computed(_.bind(function () {
            return [].concat(this.users()).concat(this.albums());
        }, this));
        this.left = ko.observable(0);
        this.top = ko.observable(0);
        this.times = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        this.currentHeldItem = ko.observable(null);
        this.currentOverItem = ko.observable(null);

        this.onFrame = _.bind(function () {
            if (this.settings.updateLayout()) {
                var start = window.performance.now();
                this.render();
                var end = window.performance.now();
                this.times.shift();
                this.times.push(end - start);
                this.stats.layoutTime(this.times.reduce((a, i) => a + i, 0).toFixed(0));
            }
            window.requestAnimationFrame(this.onFrame);
        }, this);
        window.requestAnimationFrame(this.onFrame);

        this.onMouseDown = _.bind(function (item, event) {
            this.onDown({ x: event.clientX, y: event.clientY });
        }, this);

        this.onTouchStart = _.bind(function (item, event) {
            this.onDown({ x: event.touches[0].clientX, y: event.touches[0].clientY });
        }, this);

        this.onMouseUp = _.bind(function (item) {
            this.onUp({ x: event.clientX, y: event.clientY });
        }, this);

        this.onTouchEnd = _.bind(function (item, event) {
            this.onUp({ x: event.touches[0].clientX, y: event.touches[0].clientY });
        }, this);

        this.onMouseMove = _.bind(function (data, event) {
            this.onMove({ x: event.clientX, y: event.clientY });
        }, this);

        this.onTouchMove = _.bind(function (data, event) {
            this.onMove({ x: event.touches[0].clientX, y: event.touches[0].clientY });
        }, this);

        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
    }

    Canvas.prototype.hitTest = function (relative) {
        for (const item of this.items()) {
            if (item.hitTest(relative)) {
                return item;
            }
        }
    }

    Canvas.prototype.onDown = function (pos) {
        const relative = { x: pos.x - this.left(), y: pos.y - this.top() };
        const itemHit = this.hitTest(relative);

        if (itemHit) {
            this.currentHeldItem(itemHit);
            itemHit.onMouseDown(relative);
        } else {
            this.mouseDown = true;
            this.lastX = pos.x;
            this.lastY = pos.y;
        }
    }

    Canvas.prototype.onUp = function (pos) {
        this.mouseDown = false;
        if (this.currentHeldItem()) {
            const relative = { x: pos.x - this.left(), y: pos.y - this.top() };
            this.currentHeldItem().onMouseUp(relative);
            this.currentHeldItem(null);
        }
    }

    Canvas.prototype.onMove = function (pos) {
        const relative = { x: pos.x - this.left(), y: pos.y - this.top() };
        if (this.currentHeldItem()) {
            this.currentHeldItem().onMove(relative);
        } else if (this.currentOverItem()) {
            if (this.currentOverItem().hitTest(relative)) {
                this.currentOverItem().onMove(relative);
            } else {
                this.currentOverItem().onMouseOut(relative);
                this.currentOverItem(null);
            }
        } else if (this.mouseDown) {
            this.panBy(this.lastX - pos.x, this.lastY - pos.y);
            this.lastX = pos.x;
            this.lastY = pos.y;
        } else {
            const itemHit = this.hitTest(relative);
            if (itemHit) {
                this.currentOverItem(itemHit);
                itemHit.onMouseOver(relative);
            }
        }
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

    Canvas.prototype.render = function () {
        this.ctx.clearRect(-this.left(), -this.top(), this.canvas.width, this.canvas.height);
        this.ctx.setTransform(1, 0, 0, 1, this.left(), this.top());
        for (const item of this.items()) {
            item.render(this.ctx);
        }
    };

    Canvas.prototype.setSize = function (width, height) {
        this.panBy((this.width() - width) / 2, (this.height() - height) / 2);
        this.width(width);
        this.height(height);
        this.canvas.height = height;
        this.canvas.width = width;
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
