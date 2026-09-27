<?php

return [

    /*
    |--------------------------------------------------------------------|
    | Department FK cutover (Phase 8)
    |--------------------------------------------------------------------|
    |
    | When true, HOD scoping and new writes use the department_id foreign
    | key instead of the free-text `department` string column. Both
    | columns are kept in sync while this flag is off so the cutover can
    | be flipped without a deploy. The string columns are dropped one
    | release after this flag has been on in production. See PLAN.md
    | Phase 8 and docs/architecture.md.
    |
    */
    'department_fk' => env('FEATURE_DEPARTMENT_FK', false),

];
