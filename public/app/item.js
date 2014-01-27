define([
    'fabric',
    'jquery',
    'lodash'
], function (fabric, $, _) {
    return fabric.util.createClass({
        initialize: function (uri) {
            this.uri = uri;
            this.object = new fabric.Group([
                new fabric.Rect({
                    width: 300,
                    height: 200,
                    fill: 'red'
                }),
                new fabric.Text(uri, {
                    fontSize: 30
                }),
            ]);
        },
        load: function () {
            $.getJSON('/' + this.getType() + '/' + this.uri)
             .done(_.bind(this.loaded, this));
        },
        loaded: function (data) {
            this.data = data;
        },
        getObject: function () {
            return this.object;
        }
    });
});
