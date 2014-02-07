define([
    'knockout'
], function (
    ko
) {
    var Worker = function () {
        this.queues = [];
        this.repeating = [];
        this.maxFrameLength = 10;
        this.processedLastFrame = ko.observable(0);
        this.remainingItems = ko.observable(0);
        this.onFrame = _.bind(this.onFrame, this);
        window.requestAnimationFrame(this.onFrame);
    };

    Worker.prototype.enqueue = function (func, priority) {
        var args = _.rest(arguments);
        if (!priority) {
            priority = 2;
        }
        var queue = this.queues[priority];
        if (!queue) {
            queue = this.queues[priority] = [];
        }
        queue.push(func);
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
        var count = 0;
        var queue = this.findHighestQueue();
        while (((window.performance.now() - this.frameStart) < this.maxFrameLength || count < 1) && queue.length > 0) {
            queue.shift()();
            count += 1;
            if (queue.length === 0) {
                queue = this.findHighestQueue();
            }
        }

        var remainingItems = 0;
        for (var i = 0; i < this.queues.length; i++) {
            if (this.queues[i]) {
                remainingItems += this.queues[i].length;
            }
        }
        this.processedLastFrame(count);
        this.remainingItems(remainingItems);
    };

    Worker.prototype.findHighestQueue = function () {
        for (var i = 0; i < this.queues.length; i++) {
            if (this.queues[i] && this.queues[i].length > 0) {
                return this.queues[i];
            }
        }
        return [];
    };

    Worker.prototype.onFrame = function (time) {
        window.requestAnimationFrame(this.onFrame);
        this.frameStart = window.performance.now();
        this.runRepeating();
        this.runWork();
    };

    return Worker;
});
