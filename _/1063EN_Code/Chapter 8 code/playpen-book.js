Ext.override(Ext.Button, {
    /**
     * @cfg {Mixed} transformEl
     * <p>Specify the id of a DOM element that is already present in the document that specifies some
     * structural markup for this component.</p><div><ul>
     * <li><b>Description</b> : <ul>
     * <div class="sub-desc">Used when markup is the same as Button markup to activate as Ext component.</div>
     * </ul></li>
     * <li><b>Notes</b> : <ul>
     * <div class="sub-desc">When using this config, render and applyTo are ignored.</div>
     * </ul></li>
     * </ul></div>
     */
    // private
    isRendered: false,
    arrowSelector: 'em',

    initComponent: function(){
        if (this.transformEl) {
            this.isRendered = true;
            this.applyTo = this.transformEl;
            delete this.transformEl;
        }
        this.addEvents(
            /**
             * @event click
             * Fires when this button is clicked
             * @param {Button} this
             * @param {EventObject} e The click event
             */
            'click',
            /**
             * @event toggle
             * Fires when the 'pressed' state of this button changes (only if enableToggle = true)
             * @param {Button} this
             * @param {Boolean} pressed
             */
            'toggle',
            /**
             * @event mouseover
             * Fires when the mouse hovers over the button
             * @param {Button} this
             * @param {Event} e The event object
             */
            'mouseover',
            /**
             * @event mouseout
             * Fires when the mouse exits the button
             * @param {Button} this
             * @param {Event} e The event object
             */
            'mouseout',
            /**
             * @event menushow
             * If this button has a menu, this event fires when it is shown
             * @param {Button} this
             * @param {Menu} menu
             */
            'menushow',
            /**
             * @event menuhide
             * If this button has a menu, this event fires when it is hidden
             * @param {Button} this
             * @param {Menu} menu
             */
            'menuhide',
            /**
             * @event menutriggerover
             * If this button has a menu, this event fires when the mouse enters the menu triggering element
             * @param {Button} this
             * @param {Menu} menu
             * @param {EventObject} e
             */
            'menutriggerover',
            /**
             * @event menutriggerout
             * If this button has a menu, this event fires when the mouse leaves the menu triggering element
             * @param {Button} this
             * @param {Menu} menu
             * @param {EventObject} e
             */
            'menutriggerout'
        );
        if(this.menu){
            this.menu = Ext.menu.MenuMgr.get(this.menu);
        }
        if(Ext.isString(this.toggleGroup)){
            this.enableToggle = true;
        }
    },

    onRender: function(ct, position){
        if (!this.template) {
            if (!Ext.Button.buttonTemplate) {
                // hideous table template
                Ext.Button.buttonTemplate = new Ext.Template(
                    '<table id="{4}" cellspacing="0" class="x-btn {3}"><tbody class="{1}">',
                    '<tr><td class="x-btn-tl"><i>&#160;</i></td><td class="x-btn-tc"></td><td class="x-btn-tr"><i>&#160;</i></td></tr>',
                    '<tr><td class="x-btn-ml"><i>&#160;</i></td><td class="x-btn-mc"><em class="{2}" unselectable="on"><button type="{0}"></button></em></td><td class="x-btn-mr"><i>&#160;</i></td></tr>',
                    '<tr><td class="x-btn-bl"><i>&#160;</i></td><td class="x-btn-bc"></td><td class="x-btn-br"><i>&#160;</i></td></tr>',
                    '</tbody></table>');
                Ext.Button.buttonTemplate.compile();
            }
            this.template = Ext.Button.buttonTemplate;
        }

        var btn, targs = this.getTemplateArgs();

        if (!this.isRendered) {
            if (position) {
                btn = this.template.insertBefore(position, targs, true);
            }
            else {
                btn = this.template.append(ct, targs, true);
            }
        }
        else {
            btn = this.el;

            // remove onclick from DOM and make button event
            if (btn.getAttribute('onclick')) {
                var clickString = btn.getAttribute('onclick');

                if (clickString !== '') {
                    btn.dom.removeAttribute('onclick');
                    // use supplied in preference to onclick attribute
                    if (!this.handler) {
                        if (Ext.isIE) {
                            eval("this.on('click', " + clickString + ");");
                        }
                        else {
                            eval("this.on('click', function(){ " + clickString + "});");
                        }
                    }
                }
            }

            // assign text from markup when not specified
            if (!this.text) {
                this.btnEl = btn.child(this.buttonSelector);
                this.text = this.btnEl.dom.innerHTML;
            }

            btn.child('tbody').dom.className = targs[1];

            // Menu - assign class if specified
            if(this.menu && targs[2]){
                btn.child(this.arrowSelector).addClass(targs[2]);
            }

        }

        this.btnEl = this.btnEl || btn.child(this.buttonSelector);
        this.mon(this.btnEl, {
            scope: this,
            focus: this.onFocus,
            blur: this.onBlur
        });

        this.initButtonEl(btn, this.btnEl);

        Ext.ButtonToggleMgr.register(this);
    }
});


// create custom namespace if doesn't exist
Ext.ns('Ext.apex');

Ext.apex.init = function() {
    if (Ext.isIE) {
        Ext.BLANK_IMAGE_URL = '/i/1px_trans.gif';
    }

    // Init the singleton.  Any tag-based quick tips will start working.
    Ext.QuickTips.init();

    // Apply a set of config properties to the singleton.
    // Use interceptTitles to pick up title attribute,
    // excepting IE as cannot prevent tooltip appearing also.
    Ext.apply(Ext.QuickTips.getQuickTip(), {
        interceptTitles: (!Ext.isIE),
        maxWidth: 400,
        minWidth: 100,
        showDelay: 50,
        trackMouse: true
    });


    // Convert markup buttons to Ext components
    var els = Ext.select("table.ux-btn-markup", true);
    els.each(function(el){
        var btn = new Ext.Button({transformEl: el});

        switch (btn.getText()) {
            case 'Delete' :        btn.setIconClass('ico-delete'); break;
            case 'Add Row' :       btn.setIconClass('ico-add');    break;
            case 'Cancel' :        btn.setIconClass('ico-cancel'); break;
            case 'Submit' :        btn.setIconClass('ico-submit'); break;
            case 'Apply Changes' : btn.setIconClass('ico-submit'); break;
            default : break;
        }


    });

}

// custom container
Ext.apex.Viewport = Ext.extend(Ext.Container, {
    initComponent : function() {
        Ext.apex.Viewport.superclass.initComponent.call(this);

        // APEX specific code
        this.el = Ext.get('wwvFlowForm');
        if(this.el){
            this.el.addClass('x-viewport');
            var debug = Ext.getDom('pdebug');

            if (apex.jQuery) {
                // using APEX 4+
                document.getElementsByTagName('html')[0].className += ' x-viewport';
            } else {
                // earlier versions have debugging embedded in the page
                if (!(debug && (debug.value == 'YES'))) {
                    document.getElementsByTagName('html')[0].className += ' x-viewport';
                }
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



// create custom namespace if doesn't exist
Ext.ns('Ext.apex.tree');

/**
 * @class Ext.apex.tree.TreePanel
 * @extends Ext.tree.TreePanel
 * <p>The APEX TreePanel highlights the first node with isCurrent set to true.</p>
 */
Ext.apex.tree.TreePanel = Ext.extend(Ext.tree.TreePanel, {
    afterRender : function(){
        Ext.apex.tree.TreePanel.superclass.afterRender.call(this);
        this.highlightCurrentNode();
    },

    highlightCurrentNode: function(){
        var path = this.getCurrentNodePath(this.root.attributes);

        this.expandPath(path, 'id', function(isSuccess, currentNode){
            if (isSuccess) {
                currentNode.select();
                currentNode.ensureVisible();
            }
        });
    },

    getCurrentNodePath: function(node){
        if (node.isCurrent) {
            return this.pathSeparator + node.id;
        }
        else {
            if (node.children) {
                for (var i = 0; node.children.length > i; i += 1) {
                    var result = this.getCurrentNodePath(node.children[i]);
                    if (result) {
                        return this.pathSeparator + node.id + result;
                    }
                }
            }
        }
        // not found
        return null;
    }
});


// Register container so that lazy instantiation may be used
Ext.reg('apex-treepanel', Ext.apex.tree.TreePanel);



Ext.onReady(function(){
    Ext.apex.init();

    var items = [];

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
            collapseMode: 'mini',
            collapsible: true,
            margins: '0 0 0 5',
            maxSize: 500,
            minSize: 100,
            region: 'west',
            split: true,
            title: 'Navigation',
            width: 250
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
        }, {
            id: 'gen-center-panel',
            contentEl: 'app-center-panel',
            region: 'center',
            tbar: {hidden:true, items:[]},
            title: document.title,
            xtype: 'panel'
        });
    } else {
        items.push({
            id: 'gen-center-panel',
            contentEl: 'app-center-panel',
            region: 'center',
            margins: '0 5 0 0',
            tbar: {hidden:true, items:[]},
            title: document.title,
            xtype: 'panel'
        });
    };

    new Ext.apex.Viewport({
        id: 'page-viewport',
        layout: 'border',
        defaults: {
            animCollapse: false,
            autoScroll: true,
            layout:'fit'
        },
        items: items
    });

});



/**
 * apex.da is an object.
 * Ext.apply copies the properties to the object to add/replace them.
 * Here we are doing a replace.
 */

/*
Ext.ns('std.apex.da');
std.apex.da = apex.da;

Ext.apply(apex.da, {
    enable : function(){
        if (this.affectedElements){
            apex.jQuery(this.affectedElements).each(function(i,el){
                var cmp = Ext.getCmp('ext-' + el.id);
                if (cmp) {
                    cmp.enable();
                } else {
                    apex.item(el).enable();
                }
            });
        }
    },
    disable : function(){
        if (this.affectedElements){
            apex.jQuery(this.affectedElements).each(function(i,el){
                var cmp = Ext.getCmp('ext-' + el.id);
                if (cmp) {
                    cmp.disable();
                } else {
                    apex.item(el).disable();
                }
            });
        }
    }
});
*/

Ext.override(Ext.form.ComboBox, {
    applyToMarkup : function(el){
        Ext.form.ComboBox.superclass.applyToMarkup.call(this, el);

        // remove APEX applied class
        Ext.fly(el).removeClass('apex_disabled');

        // get the Ext id for the component
        var x = this.getId();

        // Register customized standard actions for the originating DOM element.
        // Original element has been removed and replaced with ComboBox.
        apex.widget.initPageItem(el, {
            getValue: function(){ return Ext.getCmp(x).getValue();},
            setValue: function(v){Ext.getCmp(x).setValue(v);},
            enable: function(){Ext.getCmp(x).enable();},
            disable: function(){Ext.getCmp(x).disable();},
            show: function(){
                Ext.getCmp(x).show();
                Ext.select(el + '-label').show();
            },
            hide: function(){
                Ext.getCmp(x).hide();
                // hide label - relies on using label templates, and label naming convention
                // could check parent TD for label element for this el, and parent's prev sibling TD for label also.
                Ext.select(el + '-label').hide();
            }
        });


        // trigger APEX DA event when value selected
        this.on('select', function(o,record,index){
            apex.jQuery('#' + o.el.id).trigger('select');
        });

    }
});

Ext.override(Ext.form.ComboBox, {
    oneShot: false,
    setValue : function(v){
        var text = v;
        if(this.valueField){
            var r = this.findRecord(this.valueField, v);
            if(r){
                this.oneShot = false;
                text = r.data[this.displayField];
            } else {

                // do extra step for remote mode
                if (this.mode == 'remote' && this.oneShot == false) {
                    this.oneShot = true;
                    this.store.on('load', this.setValue.createDelegate(this, arguments), null, {single: true});
                    this.store.load({
                        params: {'p_widget_num_return': v}
                    });
                    return;
                } else {
                    this.oneShot = false;
                    if(Ext.isDefined(this.valueNotFoundText)){
                        text = this.valueNotFoundText;
                    }
                }
            }
        }
        this.lastSelectionText = text;
        if(this.hiddenField){
            this.hiddenField.value = Ext.value(v, '');
        }
        Ext.form.ComboBox.superclass.setValue.call(this, text);
        this.value = v;
        return this;
    }
});


var apexInitReport = initReport;
initReport = function(pRegionID, pInternalRegionID, pStyleMouseOver, pStyleChecked) {
   apexInitReport(pRegionID, pInternalRegionID, pStyleMouseOver, pStyleChecked);

   var c = 'report_' + pInternalRegionID + '_catch';

//   if (Ext.fly(c)) {
   if (apex.jQuery('#'+c).length) {
      var p = apex.jQuery('#'+c).parent(); // return parent node as a dom node

      // add a mask when any PPR actions happen
      apex.jQuery(p).bind('apexbeforerefresh', function(){
          new Ext.LoadMask(c).show();
      });
      apex.jQuery(p).bind('apexafterrefresh', function(){
          Ext.apex.Report.init(pRegionID);
      });

      Ext.apex.Report.init(pRegionID);

   }
}

Ext.ns('Ext.apex');
Ext.apex.Report = function(){
    var all = new Ext.util.MixedCollection();

    return {
        register : function(id){
            /**
             * APEX prefixes region numbers with R
             * When Partial Page Refresh is enabled the region has a wrapper element (pprEl).
             */
            all.add(id, {
                rows: 1,
                regionNum: id.substring(1),
                pprEl: 'report_' + id.substring(1) + '_catch'
            });
            return all.get(id);
        },

        get : function(id){
            return all.get(id);
        },

        setRows : function(id, n){
            var el = this.get(id);
            if (!el) {
                el = this.register(id);
            }
            el.rows = n;
        },

        all : all,

        init: function (regionID) {

            var el = this.get(regionID);
            if (el === undefined) el = this.register(regionID);

            // Add go to row functionality
            // My template has a table TR element #REGION_STATIC_ID#-right-ct
            var ct = regionID + '-right-ct';
            if (!Ext.fly(ct)) return;

            var me = this;

            var td = Ext.fly(ct).insertFirst({tag:'td',cls:'pagination'});
            new Ext.form.NumberField({
                renderTo: td,
                allowDecimals: false,
                allowNegative: false,
                value: el.rows,
                submitValue: false, /* *** important *** */
                width:30,
                listeners: {
                    specialkey: function(field, e){
                        if (e.getKey() == e.ENTER) {
                            me.setRows(regionID,this.getRawValue());
                            paginate(el.regionNum,regionID,this.getRawValue(),'This form contains unsaved changes. Press "Ok" to proceed without saving your changes.','Y');
                        }
                    }
                }
            });
            Ext.fly(ct).insertFirst({tag:'td',cls:'pagination', style:'padding-right:3px', html: 'Go to row'});
        }
    };
}();
