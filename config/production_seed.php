<?php

// Config, not a raw env() call in the command itself, because production
// runs with `config:cache` — env() would read null post-cache.
return [
    'admin_name' => env('PROD_ADMIN_NAME', 'Faculty Affairs Admin'),
    'admin_email' => env('PROD_ADMIN_EMAIL', 'admin@iiti.ac.in'),
    'admin_password' => env('PROD_ADMIN_PASSWORD'),
];
