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
