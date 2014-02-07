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
        var pushId = _.bind(function (from, to, i) {
            if (i < from.length) {
                to.push(from[i]);
                this.worker.enqueue(pushId, from, to, i + 1);
            } else {
                Item.prototype.onLoaded.call(this, data);
            }
        }, this);
        this.worker.enqueue(pushId, data.collected, this.collectedIds, 0);
    };

    User.prototype.type = 'user';
    User.prototype.relatedType = 'album';
    User.prototype.iconClass = 'glyphicon-user';

    return User;
});
