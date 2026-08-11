grant usage on schema private to service_role;
grant usage, select on sequence private.test_order_number_seq to service_role;

comment on sequence private.test_order_number_seq is
  'Interný číselný rad nezáväzných skúšobných objednávok; prístupný iba serverovej role.';
