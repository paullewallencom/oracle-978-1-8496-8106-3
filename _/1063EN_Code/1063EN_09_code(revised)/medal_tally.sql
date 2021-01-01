alter table medal_tally drop primary key cascade;

drop table medal_tally cascade constraints purge;


create table medal_tally (
 id      number
,ranking number
,country varchar2(125)
,gold    number
,silver  number
,bronze  number
,total   number
,constraint medal_tally_pk primary key (id)
);


insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (1,  1,  'Australia',                        74, 55, 48, 177 );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (2,  19, 'Bahamas',                          1,  1,  4,  6   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (3,  35, 'Bangladesh',                       0,  0,  1,  1   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (4,  22, 'Botswana',                         1,  0,  3,  4   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (5,  26, 'Cameroon',                         0,  2,  4,  6   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (6,  4,  'Canada',                           26, 17, 33, 76  );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (7,  23, 'Cayman Islands',                   1,  0,  0,  1   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (8,  12, 'Cyprus',                           4,  3,  4,  11  );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (9,  3,  'England',                          37, 60, 45, 142 );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (10, 27, 'Ghana',                            0,  1,  3,  4   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (11, 29, 'Guyana',                           0,  1,  0,  1   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (12, 2,  'India',                            38, 27, 36, 101 );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (13, 32, 'Isle of Man',                      0,  0,  2,  2   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (14, 16, 'Jamaica',                          2,  4,  1,  7   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (15, 6,  'Kenya',                            12, 11, 9,  32  );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (16, 7,  'Malaysia',                         12, 10, 14, 36  );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (17, 32, 'Mauritius',                        0,  0,  2,  2   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (18, 28, 'Namibia',                          0,  1,  2,  3   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (19, 21, 'Nauru',                            1,  1,  0,  2   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (20, 11, 'New Zealand',                      6,  22, 8,  36  );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (21, 9,  'Nigeria',                          11, 8,  14, 33  );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (22, 13, 'Northern Ireland',                 3,  3,  4,  10  );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (23, 17, 'Pakistan',                         2,  1,  2,  5   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (24, 29, 'Papua New Guinea',                 0,  1,  0,  1   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (25, 35, 'Saint Lucia',                      0,  0,  1,  1   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (26, 23, 'Saint Vincent and the Grenadines', 1,  0,  0,  1   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (27, 14, 'Samoa',                            3,  0,  1,  4   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (28, 10, 'Scotland',                         9,  10, 7,  26  );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (29, 29, 'Seychelles',                       0,  1,  0,  1   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (30, 8,  'Singapore',                        11, 11, 9,  31  );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (31, 5,  'South Africa',                     12, 11, 10, 33  );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (32, 20, 'Sri Lanka',                        1,  1,  1,  3   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (33, 32, 'Tonga',                            0,  0,  2,  2   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (34, 25, 'Trinidad and Tobago',              0,  4,  2,  6   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (35, 18, 'Uganda',                           2,  0,  0,  2   );
insert into medal_tally (id,ranking,country,gold, silver,bronze,total) values (36, 15, 'Wales',                            2,  7,  10, 19  );

commit;