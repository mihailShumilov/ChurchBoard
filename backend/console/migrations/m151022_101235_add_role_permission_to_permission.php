<?php

use yii\db\Migration;

class m151022_101235_add_role_permission_to_permission extends Migration
{
    public function safeUp()
    {
        // Get Auth manager
        $auth = \Yii::$app->authManager;

        // Get permission viewAll
        $viewAllPermission = $auth->getPermission('viewAll');

        /**
         * Create permissions for RBAC ROLE type
         */
        // List permission
        $listRBACRolePermission = $auth->createPermission('rbac_role:list');
        $listRBACRolePermission->description = 'List rbac roles';
        $auth->add($listRBACRolePermission);
        $auth->addChild($viewAllPermission, $listRBACRolePermission);


        // Create permission
        $createRBACRolePermission = $auth->createPermission('rbac_role:create');
        $createRBACRolePermission->description = 'Create rbac role';
        $auth->add($createRBACRolePermission);
        $auth->addChild($viewAllPermission, $createRBACRolePermission);


        // Delete permission
        $deleteRBACRolePermission = $auth->createPermission('rbac_role:delete');
        $deleteRBACRolePermission->description = 'Delete rbac role';
        $auth->add($deleteRBACRolePermission);
        $auth->addChild($viewAllPermission, $deleteRBACRolePermission);
    }

    public function safeDown()
    {
        // Get Auth manager
        $auth = \Yii::$app->authManager;

        /**
         * Remove permissions for RBAC ROLE type
         */
        $listRBACRolePermission = $auth->getPermission('rbac_role:list');
        $auth->remove($listRBACRolePermission);
        $createRBACRolePermission = $auth->getPermission('rbac_role:create');
        $auth->remove($createRBACRolePermission);
        $deleteRBACRolePermission = $auth->getPermission('rbac_role:delete');
        $auth->remove($deleteRBACRolePermission);
    }

    /*
    // Use safeUp/safeDown to run migration code within a transaction
    public function safeUp()
    {
    }

    public function safeDown()
    {
    }
    */
}
