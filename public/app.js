requirejs.config({
    paths: {
        jquery: '//code.jquery.com/jquery-1.10.2.min',
        bootstrap: '//netdna.bootstrapcdn.com/bootstrap/3.0.3/js/bootstrap.min',
        lodash: '//cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min',
        fabric: '//cdnjs.cloudflare.com/ajax/libs/fabric.js/1.4.0/fabric.min',
        postal: '//cdnjs.cloudflare.com/ajax/libs/postal.js/0.8.5/postal.min'
    },
    shim: {
        bootstrap: {
            deps: 'jquery'
        },
        fabric: {
            exports: 'fabric'
        }
    }
});

require(['app/main.js']);
