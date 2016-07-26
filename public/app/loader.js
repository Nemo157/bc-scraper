define([
    'lodash',
    'jquery',
    'jStorage'
], function (_, $, jStorage) {
    var Loader = function (type, scraper) {
        this.type = type;
        this.scraper = scraper;
    };

    Loader.prototype.get = function (uri, allowCached) {
        if (allowCached || typeof allowCached === 'undefined') {
            var cached = jStorage.get('bc-' + this.type + ':' + uri);
            if (cached) {
              return Promise.resolve(cached);
            }
        }
        return Promise(_.bind(function (resolve, error) {
            $.get('http://' + uri)
                .done(_.bind(function (html) {
                    try {
                        var data = this.scraper.scrape(html);
                        jStorage.set('bc-' + this.type + ':' + uri, data);
                        resolve(data);
                    } catch (err) {
                        error(err);
                    }
                }, this))
                .fail(function (err) {
                    error(err);
                });
        }, this));
    };

    return Loader;
});
