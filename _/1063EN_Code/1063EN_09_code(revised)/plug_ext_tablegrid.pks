CREATE OR REPLACE PACKAGE plug_ext_tablegrid AS
--
-- NOTES:
--   APEX does not currently provide any public way of retrieving stateful pagination info for a region.
--   This is required when a user has paginated a PPR report, and then does a page refresh.
--   The region will display data from whatever pagination was there previously, e.g. records 11-20.
--
--   It is not good practice to grant privileges on private APEX packages - they are private for good reason.
--
--   However, as no alternative is currently available I'm breaking this rule here.
--
--   EXECUTE AS A PRIVILEGED USER:
--      grant execute on APEX_040000.WWV_FLOW_DISP_PAGE_PLUGS to PLAYPEN;
--      create synonym WWV_FLOW_DISP_PAGE_PLUGS for APEX_040000.WWV_FLOW_DISP_PAGE_PLUGS;
--

   function render (
      p_region              in apex_plugin.t_region
     ,p_plugin              in apex_plugin.t_plugin
     ,p_is_printer_friendly in boolean
   )
      return apex_plugin.t_region_render_result;

   function ajax (
      p_region in apex_plugin.t_region
     ,p_plugin in apex_plugin.t_plugin
   )
      return apex_plugin.t_region_ajax_result;

END plug_ext_tablegrid;
/