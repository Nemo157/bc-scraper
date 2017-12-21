define([
    'knockout',
    'jquery',
    'lodash'
], function (ko, $, _) {
    function Simulation(settings, stats) {
        this.items = [];
        this.settings = settings;
        this.stats = stats;
        this.times = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        window.setInterval(_.bind(function () {
            if (this.settings.runSimulation()) {
                var start = window.performance.now();
                this.simulate();
                var end = window.performance.now();
                this.times.shift();
                this.times.push(end - start);
                this.stats.simulationTime(this.times.reduce((a, i) => a + i, 0).toFixed(0));
            }
        }, this), 1000 / 20);
    }

    Simulation.prototype.clear = function () {
        this.items = [];
    };

    Simulation.prototype.add = function (item) {
        this.items.push(item);
    };

    Simulation.prototype.simulate = function () {
        this.repel();
        this.attract();
        this.displace();
        this.stats.entities(this.items.length);
    };

    Simulation.prototype.repel = function () {
        var repulsion = this.settings.repulsion();

        for (var i = 0; i < this.items.length; i++) {
            var item1 = this.items[i];
            item1.force.x = item1.force.y = 0;
            if (item1.bound) continue;
            for (var j = 0; j < this.items.length; j++) {
                if (i === j) continue;
                var item2 = this.items[j];
                var dsq = (item1.pos.x - item2.pos.x) * (item1.pos.x - item2.pos.x) + (item1.pos.y - item2.pos.y) * (item1.pos.y - item2.pos.y);
                if (dsq === 0) { dsq = 0.001; }
                var coul = repulsion / dsq;
                item1.force.x += coul * (item1.pos.x - item2.pos.x);
                item1.force.y += coul * (item1.pos.y - item2.pos.y);
            }
        }
    };

    Simulation.prototype.attract = function () {
        var attraction = this.settings.attraction();

        var i, j, item1, item2, related;
        for (i = 0; i < this.items.length; i++) {
            item1 = this.items[i];
            related = item1.relatedDisplayed();
            for (j = 0; j < related.length; j++) {
                item2 = related[j];
                if (!item1.bound) {
                    item1.force.x += attraction * (item2.pos.x - item1.pos.x);
                    item1.force.y += attraction * (item2.pos.y - item1.pos.y);
                }
                item2.force.x += attraction * (item1.pos.x - item2.pos.x);
                item2.force.y += attraction * (item1.pos.y - item2.pos.y);
            }
        }
    };

    Simulation.prototype.displace = function () {
        var damping = this.settings.damping();

        var temp_pos = { x: 0, y: 0 };
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.bound) continue;
            temp_pos.x = item.pos.x;
            temp_pos.y = item.pos.y;
            item.pos.x += (item.pos.x - item.last_pos.x) * damping + item.force.x;
            item.pos.y += (item.pos.y - item.last_pos.y) * damping + item.force.y;
            item.last_pos.x = temp_pos.x;
            item.last_pos.y = temp_pos.y;
        }
    };

    return Simulation;
});
