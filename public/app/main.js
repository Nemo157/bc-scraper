define([
    './canvas',
    './user'
], function (canvas, User) {
    var user;
    canvas.add(user = new User('bandcamp.com/joshuajordan'));
    canvas.canvas.fxCenterObjectH(user.getObject());
    canvas.canvas.fxCenterObjectV(user.getObject());
    user.load();
});
