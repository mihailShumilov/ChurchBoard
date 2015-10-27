<?php

use yii\db\Migration;
use yii\db\Expression;

class m151014_142212_add_default_admin_user extends Migration
{
    public function safeUp()
    {
        $auth = \Yii::$app->authManager;
        $admin = $auth->getRole('admin');

        $this->insert('user', [
            'username' => 'admin',
            'auth_key' => Yii::$app->security->generateRandomString(),
            'password_hash' =>  Yii::$app->security->generatePasswordHash('admin'),
            'email' => 'admin@timeshare.com',
            'status' => '10',
            'role' => $admin->name,
            'access_token' => Yii::$app->security->generateRandomString(),
            'created_at' => new Expression('now()'),
            'updated_at' => new Expression('now()'),
        ]);

        $user = (new \yii\db\Query())
            ->select(['id'])
            ->from('user')
            ->where(['email' => 'admin@timeshare.com'])
            ->one();

        $auth->assign($admin, $user['id']);
    }

    public function safeDown()
    {
        $auth = \Yii::$app->authManager;
        $admin = $auth->getRole('admin');

        $user = (new \yii\db\Query())
            ->select(['id'])
            ->from('user')
            ->where(['email' => 'admin@timeshare.com'])
            ->one();

        $auth->revoke($admin, $user['id']);

        $this->delete('user', 'email = :email', [':email' => 'admin@timeshare.com']);
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
