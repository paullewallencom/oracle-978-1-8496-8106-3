-- what type of items
select i.display_as_code
      ,count(*) n
      ,count(*)*100/sum(count(*)) over (partition by null) pct 
  from APEX_APPLICATION_PAGE_ITEMS i
 where i.application_id between 4000 and 5000
   and i.display_as_code <> 'NATIVE_DISPLAY_ONLY'
 group by i.display_as_code
 order by 2 desc;


-- what type of select lists
select i.display_as_code
      ,count(*) n
  from APEX_APPLICATION_PAGE_ITEMS i
 where i.application_id between 4000 and 5000
   and i.display_as_code = 'NATIVE_SELECT_LIST'
 group by i.display_as_code
 order by 2 desc;

ATTRIBUTE_01      ,N
------------------ ------
NONE              ,1985
SUBMIT            ,128
REDIRECT_SET_VALUE,8


-- how many single-select lists => 2090
select count(*) n
  from APEX_APPLICATION_PAGE_ITEMS i
 where i.application_id between 4000 and 5000
   and i.display_as_code = 'NATIVE_SELECT_LIST'
   and nvl(i.attribute_02,'N') = 'N';


-- what type of select lists
select nvl(attribute_01,'NONE') attribute_01
      ,count(*) n
  from APEX_APPLICATION_PAGE_ITEMS i
 where i.application_id between 4000 and 5000
   and i.display_as_code = 'NATIVE_SELECT_LIST'
 group by  nvl(attribute_01,'NONE')
 order by 2 desc;

ATTRIBUTE_01      ,N
------------------ ------
NONE              ,1985
SUBMIT            ,128
REDIRECT_SET_VALUE,8


-- conservatively how many could potentially be converted to auto-combos safely => 1903 => 91%
select count(*)
  from (select i.application_id
              ,i.page_id
              ,i.item_name
          from APEX_APPLICATION_PAGE_ITEMS i
         where i.application_id between 4000 and 5000
           and i.display_as_code = 'NATIVE_SELECT_LIST'
           and nvl(i.attribute_02,'N') = 'N'
           and -- eliminate lists which are AJAX refreshed
               i.lov_cascade_parent_items is null       
           and -- eliminate parent lists of AJAX refreshed items 
               not exists (select null
                             from apex_application_page_items j
                            where j.application_id = i.application_id
                              and j.page_id = i.page_id
                              and j.lov_cascade_parent_items is not null 
                              and instr(','||j.lov_cascade_parent_items||',',','||i.item_name||',') > 0
                          )
           and -- eliminate lists invoking dynamic actions 
               not exists (select null
                             from apex_application_page_da j
                            where j.application_id = i.application_id
                              and j.page_id = i.page_id
                              and j.when_element is not null 
                              and instr(','||j.when_element||',',','||i.item_name||',') > 0
                          )
           and -- eliminate lists affected by dynamic actions 
               not exists (select null
                             from apex_application_page_da_acts j
                            where j.application_id = i.application_id
                              and j.page_id = i.page_id
                              and j.affected_elements is not null 
                              and instr(','||j.affected_elements||',',','||i.item_name||',') > 0
                          )
        );

-- show eliminated list items
select i.*
  from APEX_APPLICATION_PAGE_ITEMS i
 where i.application_id between 4000 and 5000
   and i.display_as_code = 'NATIVE_SELECT_LIST'
   and nvl(i.attribute_02,'N') = 'N'
   and  (   -- eliminate lists which are AJAX refreshed
            i.lov_cascade_parent_items is not null       
            -- eliminate parent lists of AJAX refreshed items 
         or exists (select null
                      from apex_application_page_items j
                     where j.application_id = i.application_id
                       and j.page_id = i.page_id
                       and j.lov_cascade_parent_items is not null 
                       and instr(','||j.lov_cascade_parent_items||',',','||i.item_name||',') > 0
                   )
         or -- eliminate lists invoking dynamic actions 
            exists (select null
                      from apex_application_page_da j
                     where j.application_id = i.application_id
                       and j.page_id = i.page_id
                       and j.when_element is not null 
                       and instr(','||j.when_element||',',','||i.item_name||',') > 0
                   )
         or -- eliminate lists affected by dynamic actions 
            exists (select null
                      from apex_application_page_da_acts j
                     where j.application_id = i.application_id
                       and j.page_id = i.page_id
                       and j.affected_elements is not null 
                       and instr(','||j.affected_elements||',',','||i.item_name||',') > 0
                   )
        );
        


select i.attribute_01
      ,i.attribute_02
  from APEX_APPLICATION_PAGE_ITEMS i
 where i.application_id = 103
   and i.page_id = 80
   and i.item_name = 'P80_MULTI_SELECT'
