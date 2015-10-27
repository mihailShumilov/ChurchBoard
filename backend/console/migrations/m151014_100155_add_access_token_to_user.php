<?php

use yii\db\Migration,
    yii\db\Schema;

class m151014_100155_add_access_token_to_user extends Migration
{
    public function safeUp()
    {
        $this->addColumn('user', 'access_token', $this->string());
        $this->addColumn('user', 'expires_access_token', Schema::TYPE_TIMESTAMP . ' with time zone');

        $this->dropColumn('user', 'created_at');
        $this->dropColumn('user', 'updated_at');

        $this->addColumn('user', 'created_at', Schema::TYPE_TIMESTAMP . ' with time zone');
        $this->addColumn('user', 'updated_at', Schema::TYPE_TIMESTAMP . ' with time zone');
    }

    public function safeDown()
    {
        $this->dropColumn('user', 'access_token');
        $this->dropColumn('user', 'expires_access_token');
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
