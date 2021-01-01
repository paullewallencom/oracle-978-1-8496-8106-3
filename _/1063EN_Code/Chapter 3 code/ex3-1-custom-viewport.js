
// create custom namespace if doesn't exist
Ext.ns('Ext.apex');

// custom container
Ext.apex.Viewport = Ext.extend(Ext.Container, {
    initComponent : function() {
        Ext.apex.Viewport.superclass.initComponent.call(this);

        // APEX specific code
        this.el = Ext.get('wwvFlowForm');
        if(this.el){
            this.el.addClass('x-viewport');
            var debug = Ext.getDom('pdebug');
            if (!(debug && (debug.value == 'YES'))) {
                document.getElementsByTagName('html')[0].className += ' x-viewport';
            }
        } else {
            this.el = Ext.getBody();
            document.getElementsByTagName('html')[0].className += ' x-viewport';
        }

        this.el.setHeight = Ext.emptyFn;
        this.el.setWidth = Ext.emptyFn;
        this.el.setSize = Ext.emptyFn;
        this.el.dom.scroll = 'no';
        this.allowDomMove = false;
        this.autoWidth = true;
        this.autoHeight = true;
        Ext.EventManager.onWindowResize(this.fireResize, this);
        this.renderTo = this.el;
    },

    fireResize : function(w, h){
        this.fireEvent('resize', this, w, h, w, h);
    }
});

// Register container so that lazy instantiation may be used
Ext.reg('apex-viewport', Ext.apex.Viewport);



Ext.onReady(function(){
    var items = [];

    Ext.BLANK_IMAGE_URL = '/i/1px_trans.gif';

    items.push({
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
        });

    // conditionally add east panel if it contains child nodes
    if (Ext.fly('app-east-panel') && Ext.fly('app-east-panel').first()) {
        items.push({
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
        });
    }

    new Ext.apex.Viewport({
        layout: 'border',
        defaults: {
            animCollapse: false,
            autoScroll: true
        },
        items: items
    });
});

