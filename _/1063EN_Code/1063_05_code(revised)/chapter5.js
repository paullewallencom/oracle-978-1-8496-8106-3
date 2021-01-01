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
        new Ext.Button({transformEl: el});
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
            autoScroll: true,
            layout:'fit'
        },
        items: items
    });

});

