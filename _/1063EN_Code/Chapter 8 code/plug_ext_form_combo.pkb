CREATE OR REPLACE PACKAGE BODY plug_ext_form_combo AS

CRLF constant varchar2(10) := chr(13)||chr(10);

type g_properties_type is table of varchar2(32767)
  index by varchar2(255);
g_properties g_properties_type;

--------------------------------------------------------------
-- PRIVATE UTILITY PROCEDURES
--------------------------------------------------------------
procedure push(
  p_name       in varchar2,
  p_value      in varchar2,
  p_skip_nulls in boolean default true )
is
begin
  if p_name is null then return; end if;

  if not(p_skip_nulls and p_value is null) then
    g_properties(p_name) := p_value;
  end if;
end;

procedure emit_properties(p_lpad in pls_integer default 0) is
  pd varchar2(32767) := lpad(' ',p_lpad);
  prop varchar2(255);
begin
  prop := g_properties.first();
  while prop is not null loop
    sys.htp.p(pd||prop||': '||g_properties(prop)||
      case when prop <> g_properties.last() then ',' end);
    prop := g_properties.next(prop);
  end loop;
  g_properties.delete();
end;

function get_properties(p_lpad in pls_integer default 0)
  return varchar2
is
  pd varchar2(32767) := lpad(' ',p_lpad);
  s  varchar2(32767);
  prop varchar2(255);
begin
  prop := g_properties.first();
  while prop is not null loop
    s:= s||pd||prop||': '||g_properties(prop)||
        case when prop <> g_properties.last() then ',' end||
        CRLF;
    prop := g_properties.next(prop);
  end loop;
  g_properties.delete();
  return s;
end;

function escape_json(ctext in varchar2 character set any_cs)
return varchar2 character set ctext%charset
is
begin
  return(
    replace(
    replace(
    replace(
    replace(
    replace(
    replace(
    replace(
    replace(
    replace(ctext,'\','\\')       -- reverse solidus
                 ,'/','\/')       -- solidus
                 ,'"','\"')       -- double quote
                 ,chr(8),'\b')    -- backspace
                 ,chr(12),'\f')   -- form feed
                 ,chr(10),'\n')   -- new line
                 ,chr(13),'\r')   -- carriage return
                 ,chr(9),'\t')    -- tabulation
                 ,'#hex','\u')    -- four hexadecimal digit
   );
end;

--------------------------------------------------------------
-- PRIVATE PROCEDURES
--------------------------------------------------------------
PROCEDURE emit_json_data (
  p_item   in apex_plugin.t_page_item,
  p_plugin in apex_plugin.t_plugin,
  p_value  in varchar2 )
IS
  l_sql_handler    apex_plugin_util.t_sql_handler;
  l_new_sql        varchar2(32767);
  l_col_value_list apex_plugin_util.t_column_value_list;

  /** @todo assign from combo attributes */
  l_search_type   varchar2(20) := 'EXACT_IGNORE';
  l_search_col    varchar2(32767);
  l_col_count number;

  -- assign values from ajax paramaters
  l_start     number
    := coalesce(apex_application.g_widget_action_mod, 0);

  l_limit     number
    := coalesce(apex_application.g_widget_action, 100);

  l_search_string varchar2(32767)
    := apex_application.g_x01;

  l_lookup_value  varchar2(255)
    := apex_application.g_widget_num_return;
BEGIN
  -- add ext$totalrows column to sql statement
  l_new_sql := 'select q.* ,count(*) over () ext$totalrows'||
               '  from ('||p_item.lov_definition||') q';

  l_sql_handler := apex_plugin_util.get_sql_handler (
    p_sql_statement  => l_new_sql,
    p_min_columns    => 1,
    p_max_columns    => 999,
    p_component_name => p_item.name
  );

  apex_plugin_util.free_sql_handler(l_sql_handler);

  l_col_count := l_sql_handler.column_list.count() - 1;

  if l_lookup_value is not null then
    l_search_string := apex_plugin_util.get_search_string(
      p_search_type   => l_search_type,
      p_search_string => l_lookup_value
    );
    l_search_col := l_sql_handler.column_list(2).col_name;
    l_new_sql := l_new_sql||CRLF||
      'where '||l_search_col||' = '''||
      l_search_string||'''';

  -- can't use APEX search because need to display totals
  elsif l_search_string is not null then
    l_search_string := apex_plugin_util.get_search_string(
      p_search_type   => l_search_type,
      p_search_string => l_search_string
    );
    l_search_col := l_sql_handler.column_list(1).col_name;

    l_new_sql := l_new_sql||CRLF||
      case l_search_type
      when 'CONTAINS_CASE'   then
            'where instr('||l_search_col||', '''||
            l_search_string||''') > 0'

      when 'CONTAINS_IGNORE' then
           'where instr(upper('||l_search_col||'), '''||
           l_search_string||''') > 0'

      when 'EXACT_CASE'      then
           'where '||l_search_col||' like '''||
           l_search_string||'%'''

      when 'EXACT_IGNORE'    then
           'where upper('||l_search_col||') like '''||
           l_search_string||'%'''

      when 'LOOKUP'          then
           'where '||l_search_col||' = '''||
           l_search_string||''''
      end;
  end if;

  -- get data based on our new sql statement
  l_col_value_list := apex_plugin_util.get_data (
    p_sql_statement   => l_new_sql,
    p_min_columns     => 1,
    p_max_columns     => 999,
    p_component_name  => p_item.id,
    p_first_row       => l_start,
    p_max_rows        => l_limit
  );

  -- print data
  if l_col_value_list.exists(1) then
    sys.htp.p('{"total":'||
      l_col_value_list(l_col_count + 1)(1)||',"rowset":['
    );

    for i in 1 .. l_col_value_list(1).count loop
      sys.htp.prn(case when i > 1 then ',' else ' ' end||'{');
      for j in 1 .. l_col_count loop
        sys.htp.prn(case when j > 1 then ',' end||
          '"'||l_sql_handler.column_list(j).col_name||'": '||
          '"'||escape_json(l_col_value_list(j)(i))||'"'
        );
      end loop;
      sys.htp.p('}');
    end loop;

    sys.htp.p(']}');
  else
    sys.htp.prn('{"total":0,"rowset":[]}');
  end if;

EXCEPTION
  when no_data_found then
    apex_plugin_util.free_sql_handler(l_sql_handler);
    sys.htp.prn('{"total":0,"rowset":[]}');

  when others then
    apex_plugin_util.free_sql_handler(l_sql_handler);
    raise;
END emit_json_data;



FUNCTION render_remote_store (
  p_item    in apex_plugin.t_page_item,
  p_plugin  in apex_plugin.t_plugin,
  p_value   in varchar2 )
  RETURN sys.dbms_sql.desc_tab2
IS

  l_sql_handler    apex_plugin_util.t_sql_handler;
  l_col_value_list apex_plugin_util.t_column_value_list;
  l_col_count      number;
  l_col_names      varchar2(32767);

  l_script  varchar2(32767) := q'^
  Ext.onReady(function(){
    var ns = Ext.ns('Ext.apex.#ITEM_NAME#');

    // simple array store
    ns.store = new Ext.data.JsonStore({
        url: 'wwv_flow.show',
        root: 'rowset',
        fields: [#FIELD_LIST#],
        baseParams: {
            p_flow_id: Ext.getDom('pFlowId').value,
            p_flow_step_id: Ext.getDom('pFlowStepId').value,
            p_instance: Ext.getDom('pInstance').value,
            p_request: 'PLUGIN=#AJAX_IDENTIFIER#'
        },
        paramNames: {
            start:'p_widget_action_mod',
            limit:'p_widget_action'
        }
    });
  });
  ^';

BEGIN
  -- for remote store we only need to describe the store

  -- open sql cursor and get description for sql statement
  l_sql_handler := apex_plugin_util.get_sql_handler (
    p_sql_statement  => p_item.lov_definition,
    p_min_columns    => 1,
    p_max_columns    => 999,
    p_component_name => p_item.id
  );

  -- close the open cursor created by get_sql_handler
  apex_plugin_util.free_sql_handler(l_sql_handler);

  l_col_count := l_sql_handler.column_list.count();

  -- build comma seperated string list of column names
  for i in 1 .. l_col_count loop
    l_col_names := l_col_names||
       case when i > 1 then ',' end||
       '"'||l_sql_handler.column_list(i).col_name||'"';
  end loop;

  -- substitute values into placeholders
  wwv_flow_utilities.fast_replace(l_script,
    '#ITEM_NAME#',p_item.name);

  wwv_flow_utilities.fast_replace(l_script,
    '#FIELD_LIST#',l_col_names);

  wwv_flow_utilities.fast_replace(l_script,
    '#AJAX_IDENTIFIER#',apex_plugin.get_ajax_identifier);

  -- add JS to bottom of page
  apex_javascript.add_onload_code (
    p_code => l_script );

  return l_sql_handler.column_list;
EXCEPTION
  when others then
    apex_plugin_util.free_sql_handler(l_sql_handler);
    raise;
END render_remote_store;







FUNCTION render_local_store (
  p_item    in apex_plugin.t_page_item,
  p_plugin  in apex_plugin.t_plugin,
  p_value   in varchar2 )
  RETURN sys.dbms_sql.desc_tab2
IS

  l_sql_handler    apex_plugin_util.t_sql_handler;
  l_col_value_list apex_plugin_util.t_column_value_list;
  l_col_count      number;

BEGIN
  -- open sql cursor and get description for sql statement
  l_sql_handler := apex_plugin_util.get_sql_handler (
    p_sql_statement  => p_item.lov_definition,
    p_min_columns    => 1,
    p_max_columns    => 999,
    p_component_name => p_item.id
  );

  l_col_count := l_sql_handler.column_list.count();

  -- binds all page item bind variables
  apex_plugin_util.prepare_query (
    p_sql_handler      => l_sql_handler );

  -- fetch the data
  l_col_value_list := apex_plugin_util.get_data (
    p_sql_handler => l_sql_handler );

  -- close the open cursor created by get_sql_handler
  apex_plugin_util.free_sql_handler(l_sql_handler);

  -- start script
  sys.htp.p('<script type="text/javascript">');
  sys.htp.p('Ext.onReady(function(){');
  sys.htp.p('var ns = Ext.ns("Ext.apex.'||p_item.name||'");');

  -- print data
  if l_col_value_list.exists(1) then
    sys.htp.p('ns.data = [');
    for i in 1 .. l_col_value_list(1).count loop
      sys.htp.prn(case when i > 1 then ',' else ' ' end||'[');
      for j in 1 .. l_col_count loop
        sys.htp.prn(case when j > 1 then ',' end||
          '"'||apex_plugin_util.escape(l_col_value_list(j)(i),true)||'"');
      end loop;
      sys.htp.p(']');
    end loop;
    sys.htp.p('];');
  else
    sys.htp.p('ns.data = [];');
  end if;

  -- print store
  sys.htp.p('// simple array store');
  sys.htp.p('ns.store = new Ext.data.ArrayStore({');
  sys.htp.prn('    fields: [');
  for i in 1 .. l_col_count loop
    sys.htp.prn(case when i > 1 then ',' end||
             '"'||l_sql_handler.column_list(i).col_name||'"');
  end loop;
  sys.htp.p('],');
  sys.htp.p('    data : ns.data');
  sys.htp.p('});');

  -- end script
  sys.htp.p('});');
  sys.htp.p('</script>');

  return l_sql_handler.column_list;
EXCEPTION
  when others then
    apex_plugin_util.free_sql_handler(l_sql_handler);
    raise;
END render_local_store;

--------------------------------------------------------------
-- PUBLIC PROCEDURES
--------------------------------------------------------------
FUNCTION render (
    p_item                in apex_plugin.t_page_item,
    p_plugin              in apex_plugin.t_plugin,
    p_value               in varchar2,
    p_is_readonly         in boolean,
    p_is_printer_friendly in boolean )
    return apex_plugin.t_page_item_render_result
IS
  l_result apex_plugin.t_page_item_render_result;

  subtype attr is
    apex_application_page_items.attribute_01%type;

  -- assign local names to attributes
  l_mode       attr := p_item.attribute_01;
  l_emptyText  attr := p_item.attribute_02;
  l_tpl        attr := p_item.attribute_03;
  l_pageSize   number := to_number(p_item.attribute_04);
  l_minChars   number := to_number(p_item.attribute_05);


  -- Only use escaped value for the HTML output!
  l_code          varchar2(32767);
  l_escaped_value varchar2(32767)
                    := sys.htf.escape_sc(p_value);
  l_name          varchar2(30);
  l_columns       sys.dbms_sql.desc_tab2;
BEGIN
  -- Debug information
  if apex_application.g_debug then
    apex_plugin_util.debug_page_item (
      p_plugin              => p_plugin,
      p_page_item           => p_item,
      p_value               => p_value,
      p_is_readonly         => p_is_readonly,
      p_is_printer_friendly => p_is_printer_friendly );
  end if;

  if p_is_readonly or p_is_printer_friendly then
    -- emit hidden field if necessary
    apex_plugin_util.print_hidden_if_readonly (
      p_item_name           => p_item.name,
      p_value               => p_value,
      p_is_readonly         => p_is_readonly,
      p_is_printer_friendly => p_is_printer_friendly );

    -- emit display span with the value
    apex_plugin_util.print_display_only (
      p_item_name        => p_item.name,
      p_display_value    => p_value,
      p_show_line_breaks => false,
      p_escape           => true,
      p_attributes       => p_item.element_attributes );

  else
    -- If a page item saves state, we have to call the
    -- get_input_name_for_page_item to render the internal
    -- hidden p_arg_names field. It will also return the
    -- HTML field name which we have to use when we render
    -- the HTML input field.
    l_name
      := apex_plugin.get_input_name_for_page_item(false);

    -- emit the input item to be tranformed
    sys.htp.p('<input type="text" name="'||l_name||
       '" id="'||p_item.name||'" '||
       'value="'||l_escaped_value||
       '" size="'||p_item.element_width||'" '||
       'maxlength="'||p_item.element_max_length||'" '||
       coalesce(p_item.element_attributes,
                'class="x-form-text"')||' />');

    -- call store rendering routine
    if l_mode = 'local' then
       l_columns := render_local_store (
         p_item    => p_item,
         p_plugin  => p_plugin,
         p_value   => p_value );
    else
       l_columns := render_remote_store (
         p_item    => p_item,
         p_plugin  => p_plugin,
         p_value   => p_value );
    end if;


    -- build combo properties
    -- use convention ext-xxx, where xxx is the item name
    -- makes it easy to lookup components using Ext.getCmp().
    push('id'          ,'''ext-'||p_item.name||'''');
    push('hiddenName'  ,''''||l_name||'''');
    push('hiddenValue' ,''''||l_escaped_value||'''');
    push('applyTo'     ,''''||p_item.name||'''');

    push('mode'           ,''''||l_mode||'''');
    push('forceSelection' ,'true');
    push('triggerAction'  ,'''all''');
    push('selectOnFocus'  ,'true');
    push('resizable'      ,'true');

    push('store'       ,'Ext.apex.'||p_item.name||'.store');
    push('displayField',''''||l_columns(1).col_name||'''');
    push('valueField'  ,''''||l_columns(2).col_name||'''');
    push('emptyText'   ,''''||escape_json(l_emptyText)||'''');

    -- detect DOM node disabled
    -- allows developers to set element attribute to disabled

    push('disabled',
      'Ext.fly('''||p_item.name||''').dom.disabled'
    );


    -- Can create a customized layout using Ext.XTemplates
    -- otherwise uses Ext.form.ComboBox default
    if l_tpl is not null then
       push('itemSelector' ,'''div.search-item''');
       push('tpl',
         'new Ext.XTemplate('||CRLF||l_tpl||')'
       );
    end if;

    -- lookup the display value when the value is not null
    if p_value is not null then
       push('value', '"'||escape_json(
       apex_plugin_util.get_display_data (
         p_sql_statement      => p_item.lov_definition,
         p_min_columns        => 2,
         p_max_columns        => 999,
         p_component_name     => p_item.name,
         p_search_string      => p_value,
         p_display_extra      => false) )||'"'
       );
    end if;

    -- remote combos have extra params
    if l_mode = 'remote' then
      -- the APEX ajaxIdentifier is required for AJAX processing
      push('ajaxIdentifier',
        ''''||apex_plugin.get_ajax_identifier||''''
      );

      push('queryParam'   ,'''x01''');
      push('idProperty',
        ''''||l_columns(2).col_name||''''
      );
      push('triggerClass','''x-form-search-trigger''');

      push('pageSize' ,l_pageSize);
      push('minChars' ,l_minChars);
      push('getParams' ,'function(q){var p = {};'||
        'if (this.pageSize) {p[''p_widget_action_mod''] = 0;'||
        'p[''p_widget_action''] = this.pageSize;}return p;}');
    end if;

    l_code := CRLF||
              'Ext.onReady(function(){'||CRLF||
              '    var el = new Ext.form.ComboBox({'||CRLF||
              get_properties(8)||'    });'||CRLF||
              '});'||CRLF;

    -- Initialize page item when the page has been rendered.
    apex_javascript.add_onload_code (
        p_code => l_code );

    -- Tell APEX engine that field is navigable, in case
    -- it's the first item on the page, and APEX page is
    -- configured to navigate to first item (by default).
    if p_is_readonly or p_is_printer_friendly then
      l_result.is_navigable := false;
    else
      l_result.is_navigable := true;
      -- set navigable element when not same as item name
      -- l_result.navigable_dom_id := 'some other DOM id';
    end if;

  end if;

  return l_result;
END render;


FUNCTION ajax (
  p_item   in apex_plugin.t_page_item,
  p_plugin in apex_plugin.t_plugin )
  return apex_plugin.t_page_item_ajax_result
IS
  l_result apex_plugin.t_page_item_ajax_result;
BEGIN
  -- indicate we are returning application/json data
  apex_plugin_util.print_json_http_header;

  emit_json_data (
     p_item   => p_item,
     p_plugin => p_plugin,
     p_value  => null
  );

  -- not used by APEX yet
  return l_result;
END;



FUNCTION validate (
  p_item   in     apex_plugin.t_page_item,
  p_plugin in     apex_plugin.t_plugin,
  p_value  in     varchar2 )
  return apex_plugin.t_page_item_validation_result
IS
  l_display_value varchar2(32767);
  l_result apex_plugin.t_page_item_validation_result;
BEGIN
  -- Debug information
  if apex_application.g_debug then
    apex_plugin_util.debug_page_item (
       p_plugin    => p_plugin,
       p_page_item => p_item );
  end if;

  -- Nothing to do when null (APEX checks for mandatory items)
  if p_value is null then return l_result; end if;

  -- lookup the display value when the value is not null
  if p_value is not null then
     l_display_value :=
       apex_plugin_util.get_display_data (
         p_sql_statement  => p_item.lov_definition,
         p_min_columns    => 2,
         p_max_columns    => 999,
         p_component_name => p_item.name,
         p_search_string  => p_value,
         p_display_extra  => false);

     -- return error when no display value found
     if l_display_value is null then
       l_result.message :=
         'Error: no display value found for '||
         p_item.name||' value '||p_value||'.';
     end if;
  end if;

  -- populate l_result with error message, otherwise null
  return l_result;
END;

END;
/
