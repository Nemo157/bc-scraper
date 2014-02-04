define([
    'lodash',
    './album',
    './user',
], function (_, Album, User) {
    function Cache() {
        this.collection = {};
    }

    Cache.prototype.createItem = function (constructor, uri, canvas) {
        if (!this.collection.hasOwnProperty(uri)) {
            this.collection[uri] = new constructor(uri, this, canvas);
        }

        return this.collection[uri];
    };

    Cache.prototype.updateUri = function (item, oldUri, newUri) {
        delete this.collection[oldUri];
        this.collection[newUri] = item;
    };

    Cache.prototype.createAlbum = function (canvas, uri) {
        return this.createItem(Album, uri, canvas);
    };

    Cache.prototype.createUser = function (canvas, uri) {
        return this.createItem(User, uri, canvas);
    };

    return Cache;
});
