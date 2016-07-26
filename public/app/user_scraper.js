define([
], function (
) {
    var UserScraper = function () {
    };

    UserScraper.prototype.scrape = function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");

        var name = doc.getElementsByClassName('fan-name')[0].innerText.trim();
        var collectionData = [].find.call(doc.getElementsByTagName('script'), function (script) {
            return script.innerText.match(/var CollectionData =/);
        });
        var details = JSON.parse(collectionData.innerText.match(/var CollectionData = \{\n\s*item_details: (\{(?:.*?)\})(?:,\n\s*redownload_urls: null\n\};|\n\};)/m)[1]);
        var albums = Object.keys(details).map(function (key) {
            return details[key].item_url
        });
        return {
            name: name,
            collected: albums,
        };
    };

    return UserScraper;
});
