define([
], function (
) {
    var Worker = function () {
        this.queue = [];
        this.repeating = [];
        this.onFrame = _.bind(this.onFrame, this);
        window.requestAnimationFrame(this.onFrame);
    };

    Worker.prototype.enqueue = function (func) {
        var args = _.rest(arguments);
        this.queue.push({
            func: func,
            args: args
        });
    };

    Worker.prototype.addRepeating = function (func) {
        var args = _.rest(arguments);
        this.repeating.push({
            func: func,
            args: args
        });
    };

    Worker.prototype.runRepeating = function () {
        for (var i = 0; i < this.repeating.length; i++) {
            var item = this.repeating[i];
            item.func.apply(item, item.args);
        }
    };

    Worker.prototype.runWork = function () {
        var item;
        while (this.queue.length > 0) {
            item = this.queue.pop();
            item.func.apply(item, item.args);
        }
    };

    Worker.prototype.onFrame = function () {
        this.runRepeating();
        this.runWork();
        window.requestAnimationFrame(this.onFrame);
    };

    return Worker;
});
