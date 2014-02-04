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
        this.settings = {
            damping: ko.observable(0.5),
            attraction: ko.observable(0.01),
            repulsion: ko.observable(10),
            displacement: ko.observable(0),
            updateLayout: ko.observable(true)
        };
        this.nextLayout = this.repel;
        this.boundLayout = _.bind(this.relayout, this);
        window.requestAnimationFrame(this.boundLayout);
    }

    Canvas.prototype.clear = function () {
        _.forEach(this.items(), function (item) { item.displayed(false); }, this);
        this.users.removeAll();
        this.albums.removeAll();
    };

    Canvas.prototype.add = function (items) {
        this.addUsers(_.where(items, { type: 'user' }));
        this.addAlbums(_.where(items, { type: 'album' }));
    };

    Canvas.prototype.addUsers = function (users) {
        _.forEach(users, function (user) { user.displayed(true); }, this);
        ko.utils.arrayPushAll(this.users, users);
    };

    Canvas.prototype.addAlbums = function (albums) {
        _.forEach(albums, function (album) { album.displayed(true); }, this);
        ko.utils.arrayPushAll(this.albums, albums);
    };

    Canvas.prototype.relayout = function () {
        if (this.settings.updateLayout()) {
            this.nextLayout = this.nextLayout();
        }
        window.requestAnimationFrame(this.boundLayout);
    };

    Canvas.prototype.repel = function () {
        var items = this.items();

        var repulsion = this.settings.repulsion();

        for (var i = 0; i < items.length; i++) {
            var item1 = items[i];
            item1.force.x = item1.force.y = 0;
            for (var j = 0; j < items.length; j++) {
                if (i === j) continue;
                var item2 = items[j];
                var dsq = (item1.pos.x - item2.pos.x) * (item1.pos.x - item2.pos.x) + (item1.pos.y - item2.pos.y) * (item1.pos.y - item2.pos.y);
                if (dsq === 0) { dsq = 0.001; }
                var coul = repulsion / dsq;
                item1.force.x += coul * (item1.pos.x - item2.pos.x);
                item1.force.y += coul * (item1.pos.y - item2.pos.y);
            }
        }

        return this.attract;
    };

    Canvas.prototype.attract = function () {
        var users = this.users();
        var albums = this.albums();

        var attraction = this.settings.attraction();

        var i, j, item1, item2, related;
        for (i = 0; i < users.length; i++) {
            item1 = users[i];
            related = item1.relatedDisplayed();
            for (j = 0; j < related.length; j++) {
                item2 = related[j];
                item1.force.x += attraction * (item2.pos.x - item1.pos.x);
                item1.force.y += attraction * (item2.pos.y - item1.pos.y);
                item2.force.x += attraction * (item1.pos.x - item2.pos.x);
                item2.force.y += attraction * (item1.pos.y - item2.pos.y);
            }
        }

        for (i = 0; i < albums.length; i++) {
            item1 = albums[i];
            related = item1.relatedDisplayed();
            for (j = 0; j < related.length; j++) {
                item2 = related[j];
                if (!item2.loaded()) {
                    item1.force.x += attraction * (item2.pos.x - item1.pos.x);
                    item1.force.y += attraction * (item2.pos.y - item1.pos.y);
                    item2.force.x += attraction * (item1.pos.x - item2.pos.x);
                    item2.force.y += attraction * (item1.pos.y - item2.pos.y);
                }
            }
        }

        return this.displace;
    };

    Canvas.prototype.displace = function () {
        var items = this.items();

        var damping = this.settings.damping();

        var displacement = 0;
        var localDisplacement = 0;
        var temp_pos = { x: 0, y: 0 };

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            temp_pos.x = item.pos.x;
            temp_pos.y = item.pos.y;
            item.pos.x += (item.pos.x - item.last_pos.x) * damping + item.force.x;
            item.pos.y += (item.pos.y - item.last_pos.y) * damping + item.force.y;
            localDisplacement = Math.abs(item.pos.x - temp_pos.x) + Math.abs(item.pos.y - temp_pos.y);
            displacement += localDisplacement;
            item.last_pos.x = temp_pos.x;
            item.last_pos.y = temp_pos.y;
            if (localDisplacement > 0.5) {
                item.position(item.pos);
            }
        }

        this.settings.displacement(displacement);

        return this.repel;
    };

    Canvas.prototype.onMouseWheel = function (event) {
        this.left(this.left() - event.originalEvent.deltaX);
        this.top(this.top() - event.originalEvent.deltaY);
        event.preventDefault();
    };

    return Canvas;
});
