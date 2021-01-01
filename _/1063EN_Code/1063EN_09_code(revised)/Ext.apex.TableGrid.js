Ext.ns('Ext.apex.data');

/**
 * @class Ext.apex.data.HtmlReader
 * @extends Ext.data.XmlReader
 * A customized reader used to accept APEX html/text response and
 * interpret it as a XML response.
 */
Ext.apex.data.HtmlReader = Ext.extend(Ext.data.XmlReader, {
  read: function(response){
    var doc = Ext.DomHelper.createDom({
      html: response.responseText
    });
    if (!doc) {
      throw {
        message: "XmlReader.read: XML Document not available"
      };
    }
    return this.readRecords(doc);
  },
  readRecords: function(doc){
    this.xmlData = doc;

    var root    = doc,
        totalRecords = this.meta.apexTotalRecords || 0;

    var records = this.extractData(Ext.DomQuery.select(this.meta.record, root), true);
    return {
      success: true,
      records: records,
      totalRecords:  totalRecords || records.length
    };
  }
});



Ext.ns('Ext.apex.grid');

/**
 * @class Ext.apex.TableGrid
 * @extends Ext.grid.GridPanel
 * A Grid which creates itself from an existing HTML table element.
 * @history
 * 2007-03-01 Original version by Nige "Animal" White
 * 2010-11-06 Rewritten for APEX implementation by Mark Lancaster
 * @constructor
 * @param {String/HTMLElement/Ext.Element} table The table element from which this grid will be created -
 * The table MUST have some type of size defined for the grid to fill. The container will be
 * automatically set to position relative if it isn't already.
 * @param {Object} config A config object that sets properties on this grid and has two additional
 * properties: fields and columns which allow for customizing data fields and columns for this grid.
 */
Ext.apex.TableGrid = function(table, config){
  config = config || {};

  // apply config, and a default config
  Ext.apply(this, config, {
    autoHeight: true,
    collapseFirst: false,
    iconCls: 'icon-grid',
    loadMask: true,
    stripeRows: true,
    titleCollapse: true
  });

  var fields = config.fields || [], cols = config.columns || [];

  table = Ext.get(table);

  var ct = table.insertSibling({
    id: this.id || Ext.id(),
    style: "margin-bottom: 10px"
  });

  var myReader = new Ext.apex.data.HtmlReader({
    apexTotalRecords: config.apexTotalRows || null,
    record: 'tbody tr'
  }, fields);


  // create the data store
  var ds = new Ext.data.Store({
    url: 'f',
    baseParams: {
      'p': Ext.getDom('pFlowId').value + ':' +
              Ext.getDom('pFlowStepId').value + ':' +
              Ext.getDom('pInstance').value +
              ':FLOW_PPR_OUTPUT_R' + config.regionId + '_',
      'pg_max_rows': config.apexPageSize || 15,
      'pg_rows_fetched': config.apexPageSize || 15
    },
    remoteSort: true,
    sortInfo: config.sortInfo,
    paramNames: {
      start: 'pg_min_row', // The parameter name for the start row
      limit: 'pg_max_rows' // The parameter name for number of rows to return
    },
    reader: myReader,
    listeners: {
      beforeload: function(obj, options){
        // APEX uses 1 based rowcount, so adjust
        if (options.params && options.params.pg_min_row >= 0) {
          options.params.pg_min_row += 1;
        }

        if (!options.params || !options.params.sort || !this.prevSortInfo ||
            options.params.sort == this.prevSortInfo.field &&
            options.params.dir == this.prevSortInfo.direction)
        {
          options.params.p = ds.baseParams.p + 'pg_R_' + config.regionId +':NO';
        }
        else {
          var sortConfig = 'fsp_sort_' + options.params.sort.substring(1);
          if (options.params.dir == 'ASC') {
            sortConfig += '_desc';
          }

          options = Ext.apply(options, {
            params: {
              p: ds.baseParams.p + sortConfig + '::RP',
              fsp_region_id: config.regionId,
              pg_min_row: options.params.pg_min_row || 1
            }
          });
        }
        // always remove sort params
        delete options.params.sort;
        delete options.params.dir;
      },

      load: function(obj, records, options){
        // APEX uses 1 based rowcount, so adjust
        if (options.params && options.params.pg_min_row > 0) {
          options.params.pg_min_row -= 1;
        }
        // store sort details to help identify sort requests
        this.prevSortInfo = Ext.apply({}, this.sortInfo);
      }
    }
  });


  ds.loadData(table.dom);


  var paging = new Ext.PagingToolbar({
    pageSize: config.apexPageSize || 15,
    store: ds,
    displayInfo: true,
    displayMsg: 'Displaying rows {0} - {1} of {2}'
  });


  var cm = new Ext.grid.ColumnModel({
    defaults: {
      sortable: true,
      menuDisabled: false
    },
    columns: cols
  });

  if (config.width || config.height) {
    ct.setSize(config.width || 'auto', config.height || 'auto');
  }
  else {
    ct.setWidth(table.getWidth());
  }

  table.remove();

  Ext.applyIf(this, {
    'ds': ds,
    'cm': cm,
    'sm': new Ext.grid.RowSelectionModel(),
    bbar: paging
  });


  // ------------------------------------------------------------
  // Extra functionality
  // ------------------------------------------------------------

  // add listener to resize TableGrid width
  Ext.applyIf(this, {
    listeners: {
      render: function(p){
        new Ext.Resizable(p.getEl(), {
          handles: 'e',
          pinned: true,
          transparent: true,
          resizeElement: function(){
            var box = this.proxy.getBox();
            p.updateBox(box);
            if (p.layout) {
              p.doLayout();
            }
            return box;
          }
        });
      }
    }
  });

  // Save layout changes as APEX preferences
  // create some tools using built in Ext tool ids
  var tools = [{
    id: 'restore',
    qtip: 'Restore default settings',
    handler: function(event, toolEl, panel){
      Ext.Ajax.request({
        url: 'wwv_flow.show',
        success: function(){
          Ext.Msg.alert('Message', 'Panel configuration reset.<br />' +
                                   'Refresh page for default layout.');
        },
        failure: function(){
            Ext.Msg.show({
               title:'Error',
               msg: 'Process failed.',
               buttons: Ext.Msg.OK,
               icon: Ext.MessageBox.ERROR
            });
        },
        params: {
          'p_flow_id': Ext.getDom('pFlowId').value,
          'p_flow_step_id': Ext.getDom('pFlowStepId').value,
          'p_instance': Ext.getDom('pInstance').value,
          'p_request': 'PLUGIN=' + config.apexPluginId,
          'p_widget_action': 'resetConfig'
        }
      });
    }
  }, {
    id: 'save',
    qtip: 'Save settings',
    handler: function(event, toolEl, panel){
      var f01 = [], f02 = [], f03 = [];

      var cfg = panel.getColumnModel().config;

      // capture column, width, hidden
      for (var i = 0, len = cfg.length; i < len; i++) {
          f01[i] = cfg[i].dataIndex;
          f02[i] = cfg[i].width;
          f03[i] = cfg[i].scope.hidden || null;
      }

      Ext.Ajax.request({
        url: 'wwv_flow.show',
        success: function(){
          Ext.Msg.alert('Message', 'Panel configuration saved successfully.');
        },
        failure: function(){
            Ext.Msg.show({
               title:'Error',
               msg: 'Process failed.',
               buttons: Ext.Msg.OK,
               icon: Ext.MessageBox.ERROR
            });
        },
        params: {
          'p_flow_id': Ext.getDom('pFlowId').value,
          'p_flow_step_id': Ext.getDom('pFlowStepId').value,
          'p_instance': Ext.getDom('pInstance').value,
          'p_request': 'PLUGIN=' + config.apexPluginId,
          'p_widget_action': 'saveConfig',
          'f01': f01,
          'f02': f02,
          'f03': f03,
          'x01': panel.getWidth()
        }
      });

    }
  }];


  Ext.apply(this, {
    tools: tools
  });

  Ext.apex.TableGrid.superclass.constructor.call(this, ct);
};

Ext.extend(Ext.apex.TableGrid, Ext.grid.GridPanel);
