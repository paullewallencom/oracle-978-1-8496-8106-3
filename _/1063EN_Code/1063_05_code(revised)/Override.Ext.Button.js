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
            this.applyTo = this.transformEl; //Ext.fly(this.transformEl).child('button');
            delete this.transformEl;
        }

        Ext.Button.superclass.initComponent.call(this);

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

        if (this.isRendered) {
            btn = this.el;

            // remove class from transformed btn
            btn.removeClass('ux-btn-markup');

            // remove onclick from DOM and make button event
            var clickString = btn.getAttribute('onclick');
            if (clickString) {
                btn.dom.onclick = null;

                // config handler overrides onclick attribute
                if (!this.handler) {
                    if (Ext.isIE) {
                        eval("this.on('click', " + clickString + ");");
                    }
                    else {
                        eval("this.on('click', function(){ " + clickString + "});");
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

        } else {
            if (position) {
                btn = this.template.insertBefore(position, targs, true);
            }
            else {
                btn = this.template.append(ct, targs, true);
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
