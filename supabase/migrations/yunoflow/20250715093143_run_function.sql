create or replace function "yunoflow".run_workflow(wf uuid)
returns void language plv8 as $$
  const runs = plv8.execute(
    `insert into "yunoflow"."workflow_runs"(workflow_id, status)
     values($1, 'running')
     returning id`, [wf]);
  const runId = runs[0].id;
  const tasks = plv8.execute(
    `select * from "yunoflow"."task_queue" where workflow_id = $1 order by id`,
    [wf]
  );
  tasks.forEach(task => {
    // simple task handler example
    if (task.task_name = 'js') {
      if (task.payload && task.payload.code) {
        plv8.execute(task.payload.code);
      }
    }
  });
  plv8.execute(
    `update "yunoflow"."workflow_runs" set status='finished', ended_at=now() where id=$1`,
    [runId]
  );
$$;

create or replace function "yunoflow".trigger_run_workflow()
returns trigger language plpgsql as $$
begin
  perform "yunoflow".run_workflow(new.workflow_id);
  return new;
end;
$$;

create trigger run_workflow_after_insert
after insert on "yunoflow"."workflow_runs"
for each row execute procedure "yunoflow".trigger_run_workflow();
