define([
    'knockout',
    'lodash',
    './item'
], function (ko, _, Item) {
    function Album(uri, cache, canvas) {
        Item.call(this, uri, cache, canvas);
        this.artist = ko.observable();
        this.title = ko.observable();
        this.fanIds = ko.observableArray();
        this.fans = this.fanIds.map(_.bind(this.cache.createUser, this.cache, this.canvas));
        this.related = this.fans.map(_.identity);
        this.header = ko.computed(function () {
            return this.loaded() ?  this.artist() + ' | ' + this.title() : "Loading...";
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
        this.relatedType = ko.computed(function () {
            return 'fan' + (this.relatedUndisplayed().length > 1 ? 's' : '');
        }, this);
        this.iconClass = 'glyphicon-headphones';
    }

    Album.prototype = new Item();
    Album.prototype.constructor = Album;

    Album.prototype.onLoaded = function (data) {
        Item.prototype.onLoaded.call(this, data);
        this.artist(data.artist);
        this.title(data.title);
        this.fanIds(data.fans);
    };

    Album.prototype.expand = function () {
        _.forEach(this.fans(), function (user) {
            user.moveNear(this.pos);
            user.load();
        }, this);
        this.canvas.addUsers(this.fans());
    };

    Album.prototype.getType = function () {
        return 'album';
    };

    return Album;
});
