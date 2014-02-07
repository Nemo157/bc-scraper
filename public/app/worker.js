define([
    'knockout'
], function (
    ko
) {
    var Worker = function () {
        this.queue = [];
        this.repeating = [];
        this.maxFrameLength = 10;
        this.processedLastFrame = ko.observable(0);
        this.remainingItems = ko.observable(0);
        this.onFrame = _.bind(this.onFrame, this);
        window.requestAnimationFrame(this.onFrame);
    };

    Worker.prototype.enqueue = function (func) {
        var args = _.rest(arguments);
        this.queue.push(func);
    };

    Worker.prototype.addRepeating = function (func) {
        var args = _.rest(arguments);
        this.repeating.push(func);
    };

    Worker.prototype.runRepeating = function () {
        for (var i = 0; i < this.repeating.length; i++) {
            var func = this.repeating[i];
            func();
        }
    };

    Worker.prototype.runWork = function () {
        var func, count = 0;
        while (((window.performance.now() - this.frameStart) < this.maxFrameLength || count < 1) && this.queue.length > 0) {
            func = this.queue.shift();
            func();
            count += 1;
        }
        this.processedLastFrame(count);
        this.remainingItems(this.queue.length);
    };

    Worker.prototype.onFrame = function (time) {
        window.requestAnimationFrame(this.onFrame);
        this.frameStart = window.performance.now();
        this.runRepeating();
        this.runWork();
    };

    return Worker;
});
