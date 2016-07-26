define([
], function (
) {
    var AlbumScraper = function () {
    };

    AlbumScraper.prototype.scrape = function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");

        var title = doc.getElementsByClassName('trackTitle')[0].innerText.trim();
        var artistSpan = [].find.call(doc.getElementsByTagName('span'), function (s) { return s.getAttribute('itemprop') === 'byArtist'; });
        var artist = artistSpan.innerText.trim();
        var collectorsData = doc.getElementById('collectors-data').dataset['blob'];
        var fans = JSON.parse(collectorsData)['thumbs'].map(function (fan) {
          return 'https://bandcamp.com/' + fan.username;
        });
        return {
          title: title,
          artist: artist,
          fans: fans,
        };
    };

    return AlbumScraper;
});
