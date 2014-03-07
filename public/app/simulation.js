define([
    'knockout',
    'jquery',
    'lodash'
], function (ko, $, _) {
    function Simulation(worker, settings, stats) {
        this.worker = worker;
        this.settings = settings;
        this.stats = stats;
        this.segments = [];
        this.rowStart = 0;
        this.segmentSize = settings.segmentSize();
        settings.segmentSize.subscribe(this.reset, this);
        this.worker.addRepeating(_.bind(function () {
            if (this.settings.runSimulation()) {
                this.simulate();
            }
        }, this));

    }

    Simulation.prototype.clear = function () {
        this.segments = [];
        this.rowStart = 0;
    };

    Simulation.prototype.reset = function () {
        var items = _(this.segments).flatten().flatten().value();
        this.segmentSize = this.settings.segmentSize();
        this.clear();
        items.forEach(this.add, this);
    };

    Simulation.prototype.prependRows = function (rows) {
        var row;
        if (this.segments.length === 0) {
            row = [];
            row.colStart = 0;
            this.segments.unshift(row);
            this.rowStart = -rows * this.segmentSize;
        } else {
            for (var i = 0; i < rows; i++) {
                row = [];
                row.colStart = 0;
                this.segments.unshift(row);
                this.rowStart -= this.segmentSize;
            }
        }
    };

    Simulation.prototype.prependCols = function (cols, row) {
        if (row.length === 0) {
            row.unshift([]);
            row.colStart = -cols * this.segmentSize;
        } else {
            for (var i = 0; i < cols; i++) {
                row.unshift([]);
                row.colStart -= this.segmentSize;
            }
        }
    };

    Simulation.prototype.appendRows = function (rows) {
        var row;
        if (this.segments.length === 0) {
            row = [];
            row.colStart = 0;
            this.segments.unshift(row);
            this.rowStart = rows * this.segmentSize;
        } else {
            for (var i = 0; i < rows; i++) {
                row = [];
                row.colStart = 0;
                this.segments.push(row);
            }
        }
    };

    Simulation.prototype.appendCols = function (cols, row) {
        if (row.length === 0) {
            row.push([]);
            row.colStart = cols * this.segmentSize;
        } else {
            for (var i = 0; i < cols; i++) {
                row.push([]);
            }
        }
    };

    Simulation.prototype.findRowFor = function (position) {
        var row = Math.floor((position.x - this.rowStart) / this.segmentSize);
        if (row < 0) {
            this.prependRows(-row);
            row = 0;
        } else if (row >= this.segments.length) {
            this.appendRows(row - this.segments.length + 1);
            row = this.segments.length - 1; // May have just shifted the row start rather than appending any rows.
        }
        return this.segments[row];
    };

    Simulation.prototype.findColFor = function (position, row) {
        var col = Math.floor((position.y - row.colStart) / this.segmentSize);
        if (col < 0) {
            this.prependCols(-col, row);
            col = 0;
        } else if (col >= row.length) {
            this.appendCols(col - row.length + 1, row);
            col = row.length - 1; // May have just shifted the col start rather than appending any cols.
        }
        return row[col];
    };

    Simulation.prototype.findSegment = function (position) {
        return this.findColFor(position, this.findRowFor(position));
    };

    Simulation.prototype.add = function (item) {
        this.findSegment(item.pos).push(item);
    };

    Simulation.prototype.simulate = function () {
        this.repel();
        this.attract();
        this.displace();
        this.updateSegments();
    };

    Simulation.prototype.repel = function () {
        var repulsion = this.settings.repulsion();

        for (var row = 0; row < this.segments.length; row++) {
            if (!this.segments[row]) continue;
            for (var col = 0; col < this.segments[row].length; col++) {
                if (!this.segments[row][col]) continue;
                this.repelSegment(row, col, repulsion);
            }
        }
    };

    Simulation.prototype.repelSegment = function (row, col, repulsion) {
        for (var i = 0; i < this.segments[row][col].length; i++) {
            var item1 = this.segments[row][col][i];
            item1.force.x = item1.force.y = 0;
            for (var rowJ = row - 1; rowJ <= row + 1; rowJ++) {
                if (!this.segments[rowJ]) continue;
                var colJOffset = Math.floor((this.segments[row].colStart - this.segments[rowJ].colStart) / this.segmentSize);
                for (var colJ = col - 1 + colJOffset; colJ <= col + 1 + colJOffset; colJ++) {
                    if (!this.segments[rowJ][colJ]) continue;
                    for (var j = 0; j < this.segments[rowJ][colJ].length; j++) {
                        if (rowJ === row && colJ === col && i === j) continue;
                        var item2 = this.segments[rowJ][colJ][j];
                        var dsq = (item1.pos.x - item2.pos.x) * (item1.pos.x - item2.pos.x) + (item1.pos.y - item2.pos.y) * (item1.pos.y - item2.pos.y);
                        if (dsq === 0) { dsq = 0.001; }
                        var coul = repulsion / dsq;
                        item1.force.x += coul * (item1.pos.x - item2.pos.x);
                        item1.force.y += coul * (item1.pos.y - item2.pos.y);
                    }
                }
            }
        }
    };

    Simulation.prototype.attract = function () {
        var attraction = this.settings.attraction();

        var row, col, i, j, item1, item2, related;
        for (row = 0; row < this.segments.length; row++) {
            if (!this.segments[row]) continue;
            for (col = 0; col < this.segments[row].length; col++) {
                if (!this.segments[row][col]) continue;
                for (i = 0; i < this.segments[row][col].length; i++) {
                    item1 = this.segments[row][col][i];
                    related = item1.relatedDisplayed();
                    for (j = 0; j < related.length; j++) {
                        item2 = related[j];
                        item1.force.x += attraction * (item2.pos.x - item1.pos.x);
                        item1.force.y += attraction * (item2.pos.y - item1.pos.y);
                        item2.force.x += attraction * (item1.pos.x - item2.pos.x);
                        item2.force.y += attraction * (item1.pos.y - item2.pos.y);
                    }
                }
            }
        }
    };

    Simulation.prototype.displace = function () {
        var damping = this.settings.damping();

        var count = 0, segments = 0;

        var temp_pos = { x: 0, y: 0 };
        var row, col, i, item;
        for (row = 0; row < this.segments.length; row++) {
            if (!this.segments[row]) continue;
            for (col = 0; col < this.segments[row].length; col++) {
                if (!this.segments[row][col]) continue;
                segments += 1;
                for (i = 0; i < this.segments[row][col].length; i++) {
                    count += 1;
                    item = this.segments[row][col][i];
                    if (item.bound) continue;
                    temp_pos.x = item.pos.x;
                    temp_pos.y = item.pos.y;
                    item.pos.x += (item.pos.x - item.last_pos.x) * damping + item.force.x;
                    item.pos.y += (item.pos.y - item.last_pos.y) * damping + item.force.y;
                    item.last_pos.x = temp_pos.x;
                    item.last_pos.y = temp_pos.y;
                    item.moved = false;
                }
            }
        }

        this.stats.entities(count);
        this.stats.segments(segments);
        this.stats.averagePerSegment(count / (segments || 1));
    };

    Simulation.prototype.updateSegments = function () {
        var row, col, i, item;
        for (row = 0; row < this.segments.length; row++) {
            if (!this.segments[row]) continue;
            for (col = 0; col < this.segments[row].length; col++) {
                if (!this.segments[row][col]) continue;
                for (i = 0; i < this.segments[row][col].length; i++) {
                    item = this.segments[row][col][i];
                    if (!item.moved) {
                        var xMoved = Math.floor(item.last_pos.x / this.segmentSize) != Math.floor(item.pos.x / this.segmentSize);
                        var yMoved = Math.floor(item.last_pos.y / this.segmentSize) != Math.floor(item.pos.y / this.segmentSize);
                        if (xMoved || yMoved) {
                            item.moved = true;
                            this.segments[row][col].splice(i, 1);
                            i--;
                            this.findSegment(item.pos).push(item);
                        }
                    }
                }
            }
        }
    };

    return Simulation;
});
