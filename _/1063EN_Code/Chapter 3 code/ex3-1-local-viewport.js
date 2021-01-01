Ext.onReady(function(){
    Ext.BLANK_IMAGE_URL = '../../extjs/resources/images/default/s.gif';

    new Ext.Viewport({
        layout: 'border',
        defaults: {
            animCollapse: false,
            autoScroll: true
        },
        items: [{
            applyTo: 'app-north-panel',
            autoHeight: true,
            autoScroll: false,
            region: 'north',
            style: {padding: '0 5px'},
            xtype: 'box'
        }, {
            contentEl: 'app-south-panel',
            autoScroll: false,
            height: 30,
            region: 'south',
            style: {padding: '0 5px'},
            xtype: 'box'
        }, {
            contentEl: 'app-west-panel',
            //collapseMode: 'mini',
            collapsible: true,
            margins: '0 0 0 5',
            maxSize: 500,
            minSize: 100,
            region: 'west',
            split: true,
            title: 'Navigation',
            width: 275
        }, {
            contentEl: 'app-center-panel',
            region: 'center',
            title: document.title,
            xtype: 'panel'
        }, {
            contentEl: 'app-east-panel',
            collapseMode: 'mini',
            collapsible: true,
            margins: '0 5 0 0',
            maxSize: 500,
            minSize: 100,
            region: 'east',
            split: true,
            title: 'Actions',
            width: 275
        }]
    });
});

