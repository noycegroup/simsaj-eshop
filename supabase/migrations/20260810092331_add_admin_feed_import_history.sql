create or replace view public.admin_feed_import_history
with (security_invoker = true)
as
select
  fi.id,
  s.code as supplier_code,
  s.name as supplier_name,
  fi.status,
  fi.product_count,
  fi.variant_count,
  fi.error_count,
  fi.started_at,
  fi.finished_at,
  case
    when fi.finished_at is null then null
    else greatest(0, round(extract(epoch from (fi.finished_at - fi.started_at))))::integer
  end as duration_seconds,
  fi.notes
from private.feed_imports fi
join private.suppliers s on s.id = fi.supplier_id;

revoke all on public.admin_feed_import_history from anon, authenticated;
revoke all on public.admin_feed_import_history from service_role;
grant select on public.admin_feed_import_history to service_role;

comment on view public.admin_feed_import_history is
  'Server-only história importov partnerských feedov pre administráciu SIMSAJ.';
