CREATE OR REPLACE PACKAGE BODY plug_ext_tablegrid AS

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
procedure save_config (p_region_id in number) is
   l_prefix varchar2 (255) :=
      'EXT_'||v('APP_ID')||'_'||v('APP_PAGE_ID')||'_'||
      p_region_id||'_';
begin
   wwv_flow_preferences.set_preference (
      p_preference => l_prefix || 'PANEL_WIDTH'
     ,p_value      => apex_application.g_x01
   );
   wwv_flow_preferences.set_preference (
      p_preference => l_prefix || 'COL'
     ,p_value      => wwv_flow_utilities.table_to_string2
                        (apex_application.g_f01)
   );
   wwv_flow_preferences.set_preference (
      p_preference => l_prefix || 'WIDTH'
     ,p_value      => wwv_flow_utilities.table_to_string2
                        (apex_application.g_f02)
   );
   wwv_flow_preferences.set_preference (
      p_preference => l_prefix || 'HIDDEN'
     ,p_value      => wwv_flow_utilities.table_to_string2
                        (apex_application.g_f03)
   );
   htp.p('{success: true}');
end;


procedure fetch_config (
   p_region_id   in     number
  ,p_panel_width    out varchar2
  ,p_arr_columns    out wwv_flow_global.vc_arr2
  ,p_arr_widths     out wwv_flow_global.vc_arr2
  ,p_arr_hidden     out wwv_flow_global.vc_arr2
) is
   l_prefix varchar2 (255) :=
      'EXT_'||v('APP_ID')||'_'||v('APP_PAGE_ID')||'_'||
      p_region_id||'_';
begin
   p_panel_width :=
      wwv_flow_preferences.get_preference (
         p_preference => l_prefix || 'PANEL_WIDTH'
      );

   p_arr_columns :=
      wwv_flow_utilities.string_to_table2 (
         wwv_flow_preferences.get_preference (
            p_preference => l_prefix || 'COL'
         )
      );

   p_arr_widths :=
      wwv_flow_utilities.string_to_table2 (
         wwv_flow_preferences.get_preference (
            p_preference => l_prefix || 'WIDTH'
         )
      );

   p_arr_hidden :=
      wwv_flow_utilities.string_to_table2 (
         wwv_flow_preferences.get_preference (
            p_preference => l_prefix || 'HIDDEN'
         )
      );
end;

procedure reset_config (p_region_id in number) is
   l_prefix varchar2 (255) :=
      'EXT_'||v('APP_ID')||'_'||v('APP_PAGE_ID')||'_'||
      p_region_id||'_';
begin
   wwv_flow_preferences.remove_preference (
      p_preference => l_prefix || 'PANEL_WIDTH'
   );
   wwv_flow_preferences.remove_preference (
      p_preference => l_prefix || 'COL'
   );
   wwv_flow_preferences.remove_preference (
      p_preference => l_prefix || 'WIDTH'
   );
   wwv_flow_preferences.remove_preference (
      p_preference => l_prefix || 'HIDDEN'
   );
   htp.p('{success: true}');
end;


procedure get_grid_report_properties (
   p_gridpanel_id    in     number
  ,p_rpt_region_id      out number
  ,p_page_size          out number
  ,p_sort_preference    out varchar2
  ,p_col_headings       out wwv_flow_global.vc_arr2
  ,p_col_aliases        out wwv_flow_global.vc_arr2
  ,p_col_sortable       out wwv_flow_global.vc_arr2
) is
begin
   -- Get Report details
   -- GridPanel plugin contains Report as a sub-region.
   for rec in (select r.application_id
                     ,r.page_id
                     ,r.region_id
                     ,r.number_of_rows_item
                     ,r.maximum_rows_to_query
                 from apex_application_page_regions r
                where r.parent_region_id = p_gridpanel_id
               order by r.display_sequence)
   loop
      p_rpt_region_id := rec.region_id;
      p_page_size     := nvl(rec.maximum_rows_to_query, 15);

      if rec.number_of_rows_item is not null then
         begin
            p_page_size :=
               nvl(trim(nv(rec.number_of_rows_item)), 15);
         exception
            when others then
               p_page_size := 15;
         end;
      end if;

      -- fetch report region sort preference
      p_sort_preference :=
         wwv_flow_preferences.get_preference (
            p_preference => 'FSP'||rec.application_id
                            ||'_P'||rec.page_id
                            ||'_R'||rec.region_id
                            ||'_SORT'
         );

      -- Retrieve report column details.
      -- Check conditional display logic in APEX 4.0.2+,
      -- when APEX_PLUGIN_UTIL.IS_COMPONENT_USED is available.
      --
      -- Could also retrieve column widths if exposed in
      -- APEX_APPLICATION_PAGE_RPT_COLS view. This has been
      -- requested for a future APEX version also.
      select c.heading
            ,'c'||c.display_sequence col_alias
            ,case
                when c.sortable_column = 'Yes' then 'false'
             end sortable -- APEX logic reversed
        bulk collect into
             p_col_headings
            ,p_col_aliases
            ,p_col_sortable
        from apex_application_page_rpt_cols c
       where c.region_id = rec.region_id
         and c.column_is_hidden = 'No'
      order by c.display_sequence;

      -- only retrieve 1st report
      exit;
   end loop;
end;


--------------------------------------------------------------
-- PUBLIC PROCEDURES
--------------------------------------------------------------


FUNCTION render (
   p_region              in apex_plugin.t_region
  ,p_plugin              in apex_plugin.t_plugin
  ,p_is_printer_friendly in boolean
)
   return apex_plugin.t_region_render_result is

   type t_type is table of pls_integer index by varchar2(255);
   l_default_col_idx t_type;

   l_result        apex_plugin.t_region_render_result;

   l_rpt_region_id number;
   l_total_rows    varchar2(32767);
   l_page_size     number;
   l_sort          varchar2(4000);

   l_script        varchar2(32767);
   l_fields        varchar2(32767);
   l_column_model  varchar2(32767);

   ca              varchar2(255);
   j               pls_integer;

   -- report column details
   l_col_headings  wwv_flow_global.vc_arr2;
   l_col_aliases   wwv_flow_global.vc_arr2;
   l_col_sortable  wwv_flow_global.vc_arr2;

   -- user defined preferences
   l_panel_width   varchar2(4000);
   l_pref_columns  wwv_flow_global.vc_arr2;
   l_pref_widths   wwv_flow_global.vc_arr2;
   l_pref_hidden   wwv_flow_global.vc_arr2;

BEGIN
   -- debug info
   if wwv_flow.g_debug then
      wwv_flow_plugin_util.debug_region (
         p_plugin              => p_plugin
        ,p_region              => p_region
        ,p_is_printer_friendly => p_is_printer_friendly
      );
   end if;


   -- TableGrid plugin has Classic Report as a sub-region.
   get_grid_report_properties (
      p_gridpanel_id    => p_region.id
     ,p_rpt_region_id   => l_rpt_region_id
     ,p_page_size       => l_page_size
     ,p_sort_preference => l_sort
     ,p_col_headings    => l_col_headings
     ,p_col_aliases     => l_col_aliases
     ,p_col_sortable    => l_col_sortable
   );

   if l_rpt_region_id is null then
      raise_application_error(-20001,'TableGrid Plugin'||
        ' must have a Classic Report sub-region.'
      );
   end if;


   -- Define fields for Ext Reader.
   -- This identifies the column order APEX returns the data.
   for i in 1 .. l_col_aliases.last loop
      l_fields := l_fields||case when i > 1 then ',' end||
         CRLF||'            {'||
         'name: "'||l_col_aliases(i)||'", '||
         'mapping:"td:nth('||i||')/@innerHTML"}';
   end loop;

   -- Retrieve custom user preferences for grid layout.
   -- Users can re-order column layout using drag-and-drop,
   -- and save modified layout as a user preference.
   fetch_config (
      p_region_id   => p_region.id
     ,p_panel_width => l_panel_width
     ,p_arr_columns => l_pref_columns
     ,p_arr_widths  => l_pref_widths
     ,p_arr_hidden  => l_pref_hidden
   );


   -- Define Column Model containing display details.
   -- May be based on user preferences.
   if l_pref_columns.count() = 0 then
      -- no preferences, so use defaults
      for i in 1 .. l_col_aliases.last loop
         l_column_model := l_column_model||
             chr(10)||'            {'||
             'header: "' || l_col_headings(i) || '", '||
             'dataIndex: "'||l_col_aliases(i)||'"},';
      end loop;
      l_column_model := rtrim (l_column_model,',');

      -- set view to fill table width
      push('viewConfig'   ,'{autoFill: true}');

   else

      -- Index column aliases using associative array,
      -- allowing us to lookup column position by name.
      -- i.e. l_default_col_idx('c4') = 4
      for i in 1 .. l_col_aliases.last loop
         l_default_col_idx(l_col_aliases(i)) := i;
      end loop;

      -- Ext renders columns in the order specified, so need
      -- to specify columns in same order as preferences.
      for i in 1 .. l_pref_columns.last loop
         if l_default_col_idx.exists(l_pref_columns(i)) then
            j  := l_default_col_idx(l_pref_columns(i));

            l_column_model := l_column_model||
                chr(10)||'            {'||
                'dataIndex: "'||l_col_aliases(j)||'", '||
                'header: "'   || l_col_headings(j) || '", '||
                 -- saved preferences
                'width: '     || l_pref_widths(i) ||
                case when l_pref_hidden(i) is not null then
                     ', hidden: true' end||
                '},';
         end if;
      end loop;
      l_column_model := rtrim (l_column_model,',');

   end if;


   -- APEX is stateful when paginating using PPR, but does not
   -- make the starting row information publicly accessible.
   -- This causes problems if a user has paginated to
   -- say page 2 with 10 records and then does a page refresh.
   -- There is now way for developers to identify that APEX is
   -- going to return data for page 2, starting at row 11.
   --
   -- I've raised this as an issue, and it is being considered
   -- for a release after APEX 4.02.
   --
   -- In the mean time, the workaround is to reset pagination
   -- every time the page is refreshed. This changes APEX behavior
   -- for a normal report region, but is an acceptable solution.

   -- Calculate apexTotalRows
   if p_region.attribute_01 = 'auto' then
      for rec in (select r.region_source
                    from apex_application_page_regions r
                   where r.region_id = l_rpt_region_id
                 )
      loop
         l_total_rows :=
            wwv_flow_plugin_util.get_plsql_function_result(
               p_plsql_function =>
               'declare n number; '||
               'begin select count(*) into n from ('||
               rec.region_source||'); return n; end;'
            );
      end loop;
   else
      l_total_rows :=
         wwv_flow_plugin_util.get_plsql_function_result(
            p_plsql_function => p_region.attribute_02
         );
   end if;

   -- add sortInfo preference
   -- e.g. sortInfo: {field: 'c2', direction: 'ASC'}
   if l_sort is not null then
      -- stored as fsp_sort_2 or fsp_sort_2_desc
      l_sort := substr(l_sort,10);
      case when substr(l_sort,-4) = 'desc' then
         l_sort := '{field: "c'||
                   substr(l_sort,1,length(l_sort)-5)||
                   '", direction: "ASC"}';
      else
         l_sort := '{field: "c'||l_sort||
                   '", direction: "DESC"}';
      end case;
   end if;

   -- panel width can be a preference, or default
   l_panel_width := nvl(l_panel_width,p_region.attribute_03);

   -- Assemble TableGrid config properties
   push('columns'    ,'['||l_column_model||CRLF||'        ]');
   push('fields'     ,'['||l_fields||CRLF||'        ]');

   push('apexTotalRows',l_total_rows);
   push('apexMinRow'   ,1);
   push('apexPageSize' ,l_page_size);
   push('sortInfo'     ,l_sort);

   push('id'           ,'"'||p_region.static_id||'"');
   push('regionId'     ,'"'||l_rpt_region_id||'"');
   push('title'        ,'"'||escape_json(p_region.name)||'"');
   push('width'        ,l_panel_width);
   push('collapsible'  ,p_region.attribute_04);
   push('apexPluginId',
      '"'||wwv_flow_plugin.get_ajax_identifier||'"'
   );

   l_script := CRLF||
      'Ext.onReady(function(){'||CRLF||
      '    new Ext.apex.TableGrid("report-R'||
          l_rpt_region_id||'", {'||CRLF||
          get_properties(8)||'    });'||CRLF||
      '});'||CRLF;

   -- add JS to bottom of page
   wwv_flow_javascript.add_onload_code (p_code => l_script);

   return l_result;
END;



FUNCTION ajax (
   p_region in apex_plugin.t_region
  ,p_plugin in apex_plugin.t_plugin
)
   return apex_plugin.t_region_ajax_result is
   l_result apex_plugin.t_region_ajax_result;
BEGIN
   -- indicate we are returning application/json data
   wwv_flow_plugin_util.print_json_http_header;

   -- direct to sub-routine
   case apex_application.g_widget_action
      when 'saveConfig' then
         save_config (p_region_id => p_region.id);
      when 'resetConfig' then
         reset_config (p_region_id => p_region.id);
      else
         -- invalid action
         raise_application_error(-20001,'Invalid action: "'||
           apex_application.g_widget_action||'"'
         );
   end case;


   -- not used by APEX yet
   return l_result;

EXCEPTION
   when others then
      htp.p('{success: false,');
      htp.p(' errors: {"sqlCode": "'||
              escape_json(sqlcode)||'",');
      htp.p('          "sqlErrm": "'||
              escape_json(sqlerrm)||'"');
      htp.p('         }');
      htp.p('}');
      return l_result;
END;

END plug_ext_tablegrid;
/