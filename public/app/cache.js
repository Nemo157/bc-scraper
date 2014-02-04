define([
    'lodash',
    './album',
    './user',
], function (_, Album, User) {
    function Cache() {
        this.albums = [];
        this.users = [];
    }

    Cache.prototype.createAlbum = function (canvas, uri) {
        var album = _.find(this.albums, function (album) { return album.uri() === uri; });

        if (!album) {
            album = new Album(uri, this, canvas);
            this.albums.push(album);
        }

        return album;
    };

    Cache.prototype.createUser = function (canvas, uri) {
        var user = _.find(this.users, function (user) { return user.uri() === uri; });

        if (!user) {
            user = new User(uri, this, canvas);
            this.users.push(user);
        }

        return user;
    };

    return Cache;
});
