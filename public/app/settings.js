define([
    'knockout.mapping',
    'jStorage'
], function (
    mapping,
    jStorage
) {
    var Settings = function (key, defaults) {
        this.key = key;
        this.defaults = defaults;
        mapping.fromJS(this.defaults, {}, this);
    };

    Settings.prototype.reset = function () {
        mapping.fromJS(this.defaults, this);
    };

    Settings.prototype.load = function () {
        mapping.fromJS(jStorage.get(this.key), this);
    };

    Settings.prototype.save = function () {
        jStorage.set(this.key, mapping.toJS(this));
    };

    return Settings;
});
