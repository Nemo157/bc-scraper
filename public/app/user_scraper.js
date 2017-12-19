define([
], function (
) {
    var UserScraper = function () {
    };

    UserScraper.prototype.scrape = function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        var data = JSON.parse(doc.getElementById('pagedata').dataset.blob);

        var name = data.fan_data.username;
        var collected = Object.values(data.item_cache.collection).map(item => item.item_url);

        return { name, collected };
    };

    return UserScraper;
});
