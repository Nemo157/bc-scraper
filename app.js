requirejs.config({
    paths: {
        jquery: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/1.10.2/jquery.min',
        lodash: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.4.1/lodash.min',
        fabric: 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/1.4.0/fabric.min',
        postal: 'https://cdnjs.cloudflare.com/ajax/libs/postal.js/0.8.5/postal.min',
        knockout: 'https://cdnjs.cloudflare.com/ajax/libs/knockout/3.0.0/knockout-min',
        'knockout-projections': 'https://rawgithub.com/mariusGundersen/knockout-projections/amd/dist/knockout-projections-1.0.0.min',
        'knockout.mapping': 'https://cdnjs.cloudflare.com/ajax/libs/knockout.mapping/2.4.1/knockout.mapping',
        jStorage: 'https://cdnjs.cloudflare.com/ajax/libs/jStorage/0.4.4/jstorage.min',
    },
    map: {
        '*': {
            knockout: 'knockout-shim'
        },
        'knockout-shim': {
            knockout: 'knockout'
        },
        'knockout.mapping': {
            knockout: 'knockout'
        },
        'knockout-projections': {
            knockout: 'knockout'
        },
    },
    shim: {
        fabric: {
            exports: 'fabric'
        },
        jStorage: {
            exports: '$.jStorage'
        }
    }
});

require(['app/main.js']);