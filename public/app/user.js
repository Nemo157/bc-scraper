define([
    'knockout',
    'lodash',
    './item'
], function (ko, _, Item) {
    function User(uri, cache, canvas) {
        this.init(uri, cache, canvas);
    }

    User.prototype = new Item();
    User.prototype.constructor = User;

    User.prototype.init = function (uri, cache, canvas) {
        this.name = ko.observable();
        this.collectedIds = ko.observableArray();
        this.collected = this.collectedIds.map(_.bind(cache.createAlbum, cache, canvas));
        this.related = this.collected.map(_.identity);
        this.headerText = this.name;
        Item.prototype.init.call(this, uri, cache, canvas);
    };

    User.prototype.onLoaded = function (data) {
        Item.prototype.onLoaded.call(this, data);
        this.name(data.name);
        _.forEach(data.collected, function (id) {
            _(this.push).bind(this).defer(id);
        }, this.collectedIds);
    };

    User.prototype.type = 'user';
    User.prototype.relatedType = 'album';
    User.prototype.iconClass = 'glyphicon-user';

    return User;
});
