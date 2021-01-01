Ext.onReady(function() {
  var els=Ext.select("select[multiple!='multiple']",true);
  els.each(function(el){
    if (!el.hasClass('noTransform')) {
      // save attribute as a string
      var attr = el.dom.getAttribute('onchange');
      if (attr && attr.indexOf('this.options[selectedIndex].value') != -1 ) {
        // replace Select List logic with ComboBox equivalent
        attr = attr.replace('this.options[selectedIndex].value','this.getValue()');
      }

      // transform Select List to ComboBox
      var cb = new Ext.form.ComboBox({
        id: 'cb-'+el.id,             // component id is original id prefixed by 'cb-'
        hiddenId: el.id,             // keep the original id for the hidden item
        disabled: el.dom.disabled,
        typeAhead: true,
        triggerAction: 'all',
        transform:el,
        width:el.getWidth(),
        forceSelection:true
      });

      // add on select event
      if (attr) {
        eval( "cb.on('select', function(){ " + attr + "});" );
      }
    }
  })
});

