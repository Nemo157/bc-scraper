define([
    'knockout',
    'lodash',
    './item'
], function (ko, _, Item) {
    function Album(uri, cache, canvas) {
        this.init(uri, cache, canvas);
    }

    Album.prototype = new Item();
    Album.prototype.constructor = Album;

    Album.prototype.init = function (uri, cache, canvas) {
        this.artist = ko.observable();
        this.title = ko.observable();
        this.fanIds = ko.observableArray();
        this.fans = this.fanIds.map(_.bind(cache.createUser, cache, canvas));
        this.related = this.fans.map(_.identity);
        this.headerText = ko.computed(function () {
            return this.artist() + ' | ' + this.title();
        }, this);
        Item.prototype.init.call(this, uri, cache, canvas);
    };

    Album.prototype.onLoaded = function (data) {
        this.artist(data.artist);
        this.title(data.title);
        var pushId = _.bind(function (from, to, i) {
            if (i < from.length) {
                to.push(from[i]);
                _.defer(pushId, from, to, i + 1);
            } else {
                Item.prototype.onLoaded.call(this, data);
            }
        }, this);
        pushId(data.fans, this.fanIds, 0);
    };

    Album.prototype.type = 'album';
    Album.prototype.relatedType = 'fan';
    Album.prototype.iconClass = 'glyphicon-headphones';

    return Album;
});
