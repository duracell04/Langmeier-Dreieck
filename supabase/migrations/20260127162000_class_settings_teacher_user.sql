-- Align classes with settings jsonb + teacher_user_id and update RLS

alter table classes
  add column if not exists teacher_user_id uuid,
  add column if not exists settings jsonb not null default '{}'::jsonb;

update classes
  set teacher_user_id = teacher_id
  where teacher_user_id is null;

alter table classes
  alter column teacher_user_id set not null;

create index if not exists classes_teacher_user_id_idx on classes (teacher_user_id);

update classes
  set settings = jsonb_build_object(
    'packId', pack_id,
    'defaultMode', default_mode,
    'productSets', product_sets,
    'sessionLength', session_length,
    'divisionEnabled', division_enabled,
    'squareMode', square_mode
  )
  where settings = '{}'::jsonb;

drop policy if exists "classes_select_own" on classes;
drop policy if exists "classes_insert_own" on classes;
drop policy if exists "classes_update_own" on classes;
drop policy if exists "classes_delete_own" on classes;
drop policy if exists "students_select_by_teacher" on students;
drop policy if exists "student_events_select_by_teacher" on student_events;
drop policy if exists "task_end_events_select_by_teacher" on task_end_events;

create policy "classes_select_own" on classes
  for select using (teacher_user_id = auth.uid());

create policy "classes_insert_own" on classes
  for insert with check (teacher_user_id = auth.uid());

create policy "classes_update_own" on classes
  for update using (teacher_user_id = auth.uid());

create policy "classes_delete_own" on classes
  for delete using (teacher_user_id = auth.uid());

create policy "students_select_by_teacher" on students
  for select using (
    exists (
      select 1 from classes c
      where c.id = students.class_id and c.teacher_user_id = auth.uid()
    )
  );

create policy "student_events_select_by_teacher" on student_events
  for select using (
    exists (
      select 1 from classes c
      where c.id = student_events.class_id and c.teacher_user_id = auth.uid()
    )
  );

create policy "task_end_events_select_by_teacher" on task_end_events
  for select using (
    exists (
      select 1 from classes c
      where c.id = task_end_events.class_id and c.teacher_user_id = auth.uid()
    )
  );
