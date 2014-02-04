define([
    'knockout',
    'lodash',
    './item'
], function (ko, _, Item) {
    function User(uri, cache, canvas) {
        Item.call(this, uri, cache, canvas);
        this.name = ko.observable();
        this.collectedIds = ko.observableArray();
        this.collected = this.collectedIds.map(_.bind(this.cache.createAlbum, this.cache, this.canvas));
        this.related = this.collected.map(_.identity);
        this.header = ko.computed(_.bind(function () {
            return this.loaded() ?  this.name() : "Loading...";
        }, this));
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
            return 'album' + (this.relatedUndisplayed().length > 1 ? 's' : '');
        }, this);
        this.iconClass = 'glyphicon-user';
    }

    User.prototype = new Item();
    User.prototype.constructor = User;

    User.prototype.onLoaded = function (data) {
        Item.prototype.onLoaded.call(this, data);
        this.name(data.name);
        ko.utils.arrayPushAll(this.collectedIds, data.collected);
    };

    User.prototype.expand = function () {
        _.forEach(this.collected(), function (album) {
            album.moveNear(this.pos);
            album.load();
        }, this);
        this.canvas.addAlbums(this.collected());
    };

    User.prototype.getType = function () {
        return 'user';
    };

    return User;
});
