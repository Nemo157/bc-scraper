define([
    'knockout',
    'lodash',
    './item'
], function (ko, _, Item) {
    function User(uri, cache, canvas) {
        Item.call(this, uri, cache, canvas);
        this.name = ko.observable();
        this.collected = ko.observableArray();
        this.related = ko.computed(_.bind(function () { return this.collected(); }, this));
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
        this.relatedDisplayed = ko.computed(function () {
            return _.filter(this.related(), function (album) { return album.displayed(); });
        }, this);
        this.relatedUndisplayed = ko.computed(function () {
            return _.filter(this.related(), function (album) { return !album.displayed(); });
        }, this);
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
        this.collected(_.map(data.collected, _.bind(this.cache.createAlbum, this.cache, this.canvas)));
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
