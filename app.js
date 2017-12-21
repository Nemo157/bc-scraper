var cdnjsBase = 'https://cdnjs.cloudflare.com/ajax/libs';
var cdnjs = (lib, ver, file) => `${cdnjsBase}/${lib}/${ver}/${file}`;

requirejs.config({
    paths: {
        'knockout-projections': 'https://rawgithub.com/mariusGundersen/knockout-projections/amd/dist/knockout-projections-1.0.0.min',
        'knockout.mapping': cdnjs('knockout.mapping', '2.4.1', 'knockout.mapping'),
        Bottleneck: cdnjs('bottleneck', '1.16.0', 'bottleneck'),
        fabric: cdnjs('fabric.js', '1.4.0', 'fabric.min'),
        jStorage: cdnjs('jStorage', '0.4.4', 'jstorage.min'),
        jquery: cdnjs('jquery', '1.10.2', 'jquery.min'),
        knockout: cdnjs('knockout', '3.0.0', 'knockout-min'),
        lodash: cdnjs('lodash.js', '2.4.1', 'lodash.min'),
        postal: cdnjs('postal.js', '0.8.5', 'postal.min'),
    },
    map: {
        '*': {
            knockout: 'knockout-shim',
        },
        'knockout-shim': {
            knockout: 'knockout',
        },
        'knockout.mapping': {
            knockout: 'knockout',
        },
        'knockout-projections': {
            knockout: 'knockout',
        },
    },
    shim: {
        Bottleneck: {
          exports: 'Bottleneck',
        },
        fabric: {
          exports: 'fabric',
        },
        jStorage: {
          exports: '$.jStorage',
        }
    }
});

require(['app/main.js']);
