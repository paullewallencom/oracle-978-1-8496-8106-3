CREATE OR REPLACE PACKAGE plug_ext_form_combo AS
--------------------------------------------------------------------------------
--
--    NAME
--      plug_ext_form_combo.pks
--
--    DESCRIPTION
--      This package implements the Ext.form.ComboBox as a plug-in.
--
--    RUNTIME DEPLOYMENT: YES
--
--    MODIFIED   (MM/DD/YYYY)
--    mark        31/07/2010 - Created
--------------------------------------------------------------------------------

function render (
    p_item                in apex_plugin.t_page_item,
    p_plugin              in apex_plugin.t_plugin,
    p_value               in varchar2,
    p_is_readonly         in boolean,
    p_is_printer_friendly in boolean )
    return apex_plugin.t_page_item_render_result;

function ajax (
    p_item   in apex_plugin.t_page_item,
    p_plugin in apex_plugin.t_plugin )
    return apex_plugin.t_page_item_ajax_result;


function validate (
    p_item   in     apex_plugin.t_page_item,
    p_plugin in     apex_plugin.t_plugin,
    p_value  in     varchar2 )
    return apex_plugin.t_page_item_validation_result;

END;
/
