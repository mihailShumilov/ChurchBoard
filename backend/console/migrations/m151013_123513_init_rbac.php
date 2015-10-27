<?php

use yii\db\Migration;

class m151013_123513_init_rbac extends Migration
{
    public function safeUp()
    {
        // add role field to user table
        $this->addColumn('user', 'role', $this->string());

        $auth = \Yii::$app->authManager;

        // Create admin rule
        $admin = $auth->createRole('admin');
        $admin->description = 'Admin rule';

        // Add admin rule
        $auth->add($admin);

        // Create viewAll permission
        $viewAll = $auth->createPermission('viewAll');
        $viewAll->description = 'View All permission. This permission allow view any resource';

        // Add viewAll permission
        $auth->add($viewAll);

        // Add viewAll permission to admin role
        $auth->addChild($admin, $viewAll);
    }

    public function safeDown()
    {
        // remove role field from user table
        $this->dropColumn('user', 'role');

        $auth = \Yii::$app->authManager;
        // Remove viewAll permission
        $viewAll = $auth->getPermission('viewAll');
        $auth->remove($viewAll);

        // Remove admin role
        $admin = $auth->getRole('admin');
        $auth->remove($admin);
    }
}
