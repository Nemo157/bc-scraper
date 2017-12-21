define([
    'knockout'
], function (
    ko
) {
    var Worker = function (stats) {
        this.stats = stats;
        this.queues = [];
        this.maxFrameLength = 10;
        this.running = false;
        this.runWork = this.runWork.bind(this);
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
        if (!this.running) {
            setTimeout(this.runWork, 0);
            this.running = true;
        }
        this.stats.remainingItems(this.stats.remainingItems() + 1);
    };

    Worker.prototype.runWork = function () {
        var queue = this.findHighestQueue();
        if (queue.length > 0) {
          queue.shift()();
          this.stats.remainingItems(this.stats.remainingItems() - 1);
          setTimeout(this.runWork, 0);
          this.running = true;
        } else {
          this.running = false;
        }
    };

    Worker.prototype.findHighestQueue = function () {
        for (var i = 0; i < this.queues.length; i++) {
            if (this.queues[i] && this.queues[i].length > 0) {
                return this.queues[i];
            }
        }
        return [];
    };

    return Worker;
});
