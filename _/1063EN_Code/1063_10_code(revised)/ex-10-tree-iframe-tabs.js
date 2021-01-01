Ext.BLANK_IMAGE_URL = '../../extjs/resources/images/default/s.gif';
Ext.ns('Ext.apex');

Ext.apex.IFrameComponent = Ext.extend(Ext.BoxComponent, {
  /**
   * The url to be shown in iframe
   * @type {String}
   */
  url: Ext.SSL_SECURE_URL,

  /**
   * @private Just render an iframe
   */
  onRender: function(ct, position){
    var url = this.url;
    this.el = ct.createChild({
      tag: 'iframe',
      id: 'iframe-' + this.id,
      frameBorder: 0,
      src: url
    });
  }
});
Ext.reg('iframe', Ext.apex.IFrameComponent);


//
// This is the main layout definition.
//
Ext.onReady(function(){

  Ext.QuickTips.init();

  var contentPanel = {
    id: 'content-panel',
    region: 'center', // this is what makes this panel into a region within the containing layout
    xtype: 'tabpanel',
    margins: '2 5 5 0',
    enableTabScroll: true,
    activeItem: 0,
    plugins: new Ext.ux.TabCloseMenu(),
    border: true,
    defaultType: 'iframe',
    defaults: {
      closable: true
    },
    items: [{
      xtype: 'panel',
      closable: false,
      title: 'Normal Tab',
      contentEl: 'wwvFlowForm'
    }]
  };



  // Go ahead and create the TreePanel now so that we can use it below
  var treePanel = new Ext.tree.TreePanel({
    id: 'tree-panel',
    region: 'center',
    minSize: 150,
    autoScroll: true,
    border: false,

    // tree-specific configs:
    rootVisible: false,
    lines: false,
    singleExpand: true,
    useArrows: true,

    loader: new Ext.tree.TreeLoader({
      clearOnLoad: false,
      preloadChildren: true,
      pathSeparator: '>'
    }),

    root: new Ext.tree.AsyncTreeNode({
      leaf: false,
      expanded: true,
      text: 'Tree Root',
      draggable: false,
      children: jsonTreeData
    })
  });


  // only make leaf nodes selectable
  treePanel.getSelectionModel().on('beforeselect', function(sm, node){
    return node.isLeaf();
  });

  // Assign the changeLayout function to be called on tree node click.
  treePanel.on('click', function(node, e){
    e.stopEvent();
    if (!node.isLeaf())
      return false;

    var tab, tabs = Ext.getCmp('content-panel');

    if (tabs && (tab = tabs.getComponent('tab-' + node.id))) {
      tabs.setActiveTab(tab);
    }
    else {
      tab = tabs.add({
        title: node.text,
        id: 'tab-' + node.id,
        url: node.attributes.href,
        closable: true
      });
      tab.show();
    };
  });


  // Finally, build the main layout once all the pieces are ready.
  new Ext.Viewport({
    layout: 'border',
    items: [{
      applyTo: 'app-north-panel',
      autoHeight: true,
      autoScroll: false,
      region: 'north',
      style: {
        padding: '0 5px'
      },
      xtype: 'box'
    }, {
      layout: 'border',
      id: 'navigationPanel',
      title: 'Navigation',
      region: 'west',
      border: true,
      split: true,
      margins: '2 0 5 5',
      width: 275,
      minSize: 100,
      maxSize: 500,
      animCollapse: false,
      animate: false,
      collapsible: true,
      collapseMode: 'mini',
      items: [treePanel]
    }, contentPanel]
  });

  Ext.getCmp('content-panel').on('tabchange', function(tp, tab){
    treePanel.getSelectionModel().clearSelections();

    var node = treePanel.getNodeById(tab.id.substring(4));
    if (node) {
      node.ensureVisible();
      node.select();
    }
  });


});
