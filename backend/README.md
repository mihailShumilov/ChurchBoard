# Requirement
* PHP 5.4+
* PostgreSQL 9.4+
* nginx 1.4.6+
* php5-fpm

# Installation
1) Clone repository into new directory

    $ cd ~
    $ git clone git@github.com:mihailShumilov/ChurchBoard.git

2) Install <a href="https://github.com/francoispluchino/composer-asset-plugin/">composer asset plugin</a>
which allows managing bower and npm package dependencies through Composer

    $ composer global require "fxp/composer-asset-plugin:~1.0.3"

3) cd "path/to/your-application-folder/core"

4)  Install the application using composer

    $ composer install

5)  Execute the init command and select dev as environment.

    $ php init

Otherwise, in production execute init in non-interactive mode.

    $ php init --env=Production --overwrite=All


6) Create a new database ("timeshare") and adjust the components['db'] configuration in common/config/main-local.php accordingly.

   ```
   'db' => [
       'class' => 'yii\db\Connection',
       'dsn' => 'pgsql:host=localhost;port=5432;dbname=timeshare',
       'username' => 'db_name',
       'password' => 'db_pass',
       'charset' => 'utf8',
   ]
   ```

7) Apply migration for RBAC DbManager

   ```
   $ yii migrate --migrationPath=@yii/rbac/migrations
   ```

8) Apply migrations with console command yii migrate.

   ```
    migrate up
   ```

8) Set document roots of your web server:

     server {
           charset utf-8;
           client_max_body_size 128M;

           listen 80; ## listen for ipv4
           #listen [::]:80 default_server ipv6only=on; ## listen for ipv6

           server_name timeshare.loc;
           root        /path/to/yii-application/api/web/;
           index       index.php;

           access_log  /path/to/yii-application/log/frontend-access.log;
           error_log   /path/to/yii-application/log/frontend-error.log;

           location / {
               # Redirect everything that isn't a real file to index.php
               try_files $uri $uri/ /index.php?$args;
           }

           # uncomment to avoid processing of calls to non-existing static files by Yii
           #location ~ \.(js|css|png|jpg|gif|swf|ico|pdf|mov|fla|zip|rar)$ {
           #    try_files $uri =404;
           #}
           #error_page 404 /404.html;

           location ~ \.php$ {
               include fastcgi_params;
               fastcgi_param SCRIPT_FILENAME $document_root/$fastcgi_script_name;
               fastcgi_pass   127.0.0.1:9000;
               #fastcgi_pass unix:/var/run/php5-fpm.sock;
               try_files $uri =404;
           }

           location ~ /\.(ht|svn|git) {
               deny all;
           }
       }


9) Set hosts:
    ```
    127.0.0.1   timeshare.loc
    ```


