define([
    'knockout',
    'jquery',
    'lodash'
], function (ko, $, _) {
    function Canvas() {
        this.users = ko.observableArray();
        this.albums = ko.observableArray();
        this.items = ko.computed(_.bind(function () {
            return [].concat(this.users()).concat(this.albums());
        }, this));
        this.left = ko.observable(0);
        this.top = ko.observable(0);
        this.damping = ko.observable(0.5);
        this.attraction = ko.observable(0.01);
        this.repulsion = ko.observable(10);
        this.displacement = ko.observable(0);
        this.damping.subscribe(this.relayout, this);
        this.attraction.subscribe(this.relayout, this);
        this.repulsion.subscribe(this.relayout, this);
    }

    Canvas.prototype.clear = function () {
        this.users.removeAll();
        this.albums.removeAll();
    };

    Canvas.prototype.addUsers = function (users) {
        _.forEach(users, function (user) {
            if (!user.displayed) {
                user.displayed = true;
                user.loaded.subscribe(this.relayout, this);
            }
        }, this);
        this.users(_.union(this.users(), users));
        this.relayout();
    };

    Canvas.prototype.addAlbums = function (albums) {
        _.forEach(albums, function (album) {
            if (!album.displayed) {
                album.displayed = true;
                album.loaded.subscribe(this.relayout, this);
            }
        }, this);
        this.albums(_.union(this.albums(), albums));
        this.relayout();
    };

    Canvas.prototype.relayout = function () {
        if (this.interval) {
            return;
        }

        this.interval = window.setInterval(_.bind(function () {
            var items = this.items();

            var repulsion = this.repulsion();
            var attraction = this.attraction();
            var damping = this.damping();

            var dsq, coul;
            _.forEach(items, function (item1) {
                item1.force.x = item1.force.y = 0;
                _(items).without(item1).forEach(function (item2) {
                    dsq = (item1.pos.x - item2.pos.x) * (item1.pos.x - item2.pos.x) + (item1.pos.y - item2.pos.y) * (item1.pos.y - item2.pos.y);
                    if (dsq === 0) { dsq = 0.001; }
                    coul = repulsion / dsq;
                    item1.force.x += coul * (item1.pos.x - item2.pos.x);
                    item1.force.y += coul * (item1.pos.y - item2.pos.y);
                });
            });

            _.forEach(items, function (item1) {
                _.forEach(item1.related(), function (item2) {
                    if (item2.displayed) {
                        item1.force.x += attraction * (item2.pos.x - item1.pos.x);
                        item1.force.y += attraction * (item2.pos.y - item1.pos.y);
                        item2.force.x += attraction * (item1.pos.x - item2.pos.x);
                        item2.force.y += attraction * (item1.pos.y - item2.pos.y);
                    }
                });
            });


            var displacement = 0;
            _.forEach(items, function (item) {
                item.velocity.x = (item.velocity.x + item.force.x) * damping;
                item.velocity.y = (item.velocity.y + item.force.y) * damping;
                displacement += Math.abs(item.velocity.x) + Math.abs(item.velocity.y);
                item.pos.x += item.velocity.x;
                item.pos.y += item.velocity.y;
                item.position(item.pos);
            });

            if (displacement < 0.05 * items.length) {
                window.clearInterval(this.interval);
                this.interval = 0;
            }

            this.displacement(displacement);
        }, this), 1000 / 60);
    };

    Canvas.prototype.onMouseWheel = function (event) {
        this.left(this.left() - event.originalEvent.deltaX);
        this.top(this.top() - event.originalEvent.deltaY);
        event.preventDefault();
    };

    return Canvas;
});
