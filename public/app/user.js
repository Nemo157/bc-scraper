define([
    'knockout',
    'lodash',
    './item'
], function (ko, _, Item) {
    function User(uri, cache, worker, canvas) {
        this.init(uri, cache, worker, canvas);
    }

    User.prototype = new Item();
    User.prototype.constructor = User;

    User.prototype.init = function (uri, cache, worker, canvas) {
        this.name = ko.observable();
        this.collectedIds = ko.observableArray();
        this.collected = this.collectedIds.map(_.bind(cache.createAlbum, cache, canvas));
        this.related = this.collected.map(_.identity);
        this.headerText = this.name;
        Item.prototype.init.call(this, uri, cache, worker, canvas);
    };

    User.prototype.onLoaded = function (data) {
        this.name(data.name);
        for (var i = 0; i < data.collected.length; i++) {
            this.worker.enqueue(_.bind(this.collectedIds.push, this.collectedIds, data.collected[i]));
        }
        this.worker.enqueue(_.bind(Item.prototype.onLoaded, this, data));
    };

    User.prototype.type = 'user';
    User.prototype.relatedType = 'album';
    User.prototype.iconClass = 'glyphicon-user';

    return User;
});
