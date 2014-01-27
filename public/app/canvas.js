define([
    'fabric',
    'jquery',
    'lodash'
], function (fabric, $, _) {
    $('#navbar').css('margin', '0px');

    var canvas = {
        canvas: new fabric.Canvas('canvas', {
            selection: false
        }),
        add: function (item) {
            var object = item.getObject();
            object.set({ hasControls: false, selectable: false });
            this.canvas.add(object);
        },
        updateSize: function () {
            this.canvas.setWidth(window.innerWidth);
            this.canvas.setHeight(window.innerHeight - $('#navbar').height());
        },
        onMouseDown: function (options) {
            this.mouseDown = true;
            this.dragX = options.e.x;
            this.dragY = options.e.y;
        },
        onMouseMove: function (options) {
            if (this.mouseDown) {
                if (!this.dragging) {
                    this.startDragging();
                }
                this.pan(this.dragX - options.e.x, this.dragY - options.e.y);
                this.dragX = options.e.x;
                this.dragY = options.e.y;
            }
        },
        onMouseUp: function (options) {
            this.mouseDown = false;
            if (this.dragging) {
                this.stopDragging();
            }
        },
        onMouseWheel: function (event) {
            this.pan(event.originalEvent.deltaX, event.originalEvent.deltaY);
            event.preventDefault();
        },
        startDragging: function () {
        },
        stopDragging: function () {
        },
        pan: function (dX, dY) {
            this.canvas.forEachObject(function (object) {
                object.setLeft(object.getLeft() - dX);
                object.setTop(object.getTop() - dY);
            }, this);
            this.canvas.renderAll();
        }
    };

    canvas.canvas.on('mouse:down', _.bind(canvas.onMouseDown, canvas));
    canvas.canvas.on('mouse:move', _.bind(canvas.onMouseMove, canvas));
    canvas.canvas.on('mouse:up', _.bind(canvas.onMouseUp, canvas));

    canvas.updateSize();
    $(window).on('mousewheel', _.bind(canvas.onMouseWheel, canvas));
    $(window).resize(_.bind(canvas.updateSize, canvas));

    return canvas;
});
