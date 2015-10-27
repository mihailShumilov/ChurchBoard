<?php
namespace app\modules\v1\controllers;

use api\controllers\BaseActiveController,
    common\models\AuthItem,
    common\models\AuthAssignment,
    common\models\User,
    yii\web\NotFoundHttpException,
    yii\filters\AccessControl,
    yii\web\ServerErrorHttpException,
    yii\data\ActiveDataProvider;

class CredentialController extends BaseActiveController
{
    public $modelClass = 'common\models\AuthItem';

    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        return array_merge(parent::behaviors(), [
            'access' => [
                'class' => AccessControl::className(),
                'rules' => [
                    [
                        'actions' => ['create'],
                        'allow'   => true,
                        'roles' => ['rbac_role:create']
                    ],
                    [
                        'actions' => ['delete'],
                        'allow'   => true,
                        'roles' => ['rbac_role:delete']
                    ],
                    [
                        'actions' => ['index', 'get-permission-for-entity'],
                        'allow'   => true,
                        'roles' => ['rbac_role:list']
                    ],
                    [
                        'actions' => ['set-permission-for-entity'],
                        'allow'   => true,
                        'roles' => ['rbac_role:create']
                    ],
                    [
                        'actions' => ['options'],
                        'allow'   => true,
                    ],
                ],
            ],
        ]);
    }

    /**
     * @inheritdoc
     */
    public function actions()
    {
        $actions = array_merge(parent::actions(), [
            'index' => [
                'class' => 'yii\rest\IndexAction',
                'modelClass' => $this->modelClass,
                'checkAccess' => [$this, 'checkAccess'],
                'prepareDataProvider' => function(){
                    $query = AuthItem::find();
                    $dataProvider = new ActiveDataProvider(['query' => $query, 'pagination' => false]);
                    return $dataProvider;
                }
            ],
            'delete' => [
                'class' => 'yii\rest\DeleteAction',
                'modelClass' => $this->modelClass,
                'checkAccess' => [$this, 'checkAccess'],
                'findModel' => function($id){
                    $model = AuthItem::find()->where(['name' => $id, 'type' => AuthItem::TYPE_ROLE])->one();
                    if (isset($model)) {
                       return $model;
                    } else {
                        throw new NotFoundHttpException("Object not found: $id");
                    }
                }
            ],
        ]);

        //remove not used action
        unset($actions['update'], $actions['view'], $actions['create']);

        return $actions;
    }

    /**
     * Create role and if exist add permission to role
     * @return mixed
     * @throws \Exception
     */
    public function actionCreate()
    {
        $model = new $this->modelClass([
            'scenario' => AuthItem::SCENARIO_ADD_ROLE,
        ]);

        $model->load(\Yii::$app->getRequest()->getBodyParams(), '');
        if ($model->validate()){
            $transaction = AuthItem::getDb()->beginTransaction();
            try {
                if ($model->save()) {
                    // manage permission for roles
                    $requestData = \Yii::$app->getRequest()->getBodyParams();
                    $listOfPermissions = !empty($requestData['items']) ? $requestData['items'] : [];

                    // Check if requested permission available
                    $uniquePermissions = [];
                    foreach ($listOfPermissions as $permissionName) {
                        $permission = \Yii::$app->authManager->getPermission($permissionName);
                        if (!$permission) {
                            throw new NotFoundHttpException("Invalid request");
                        }
                        if (!isset($uniquePermissions[$permissionName])) {
                            $uniquePermissions[$permissionName] = $permission;
                        }
                    }

                    $role = \Yii::$app->authManager->getRole($model->name);
                    if ($role) {
                        // Remove all assignments for current user
                        \Yii::$app->authManager->removeChildren($role);

                        // Add new assignments
                        foreach ($uniquePermissions as $permission) {
                            \Yii::$app->authManager->addChild($role, $permission);
                        }
                    } else {
                        throw new NotFoundHttpException("Invalid request");
                    }
                } elseif (!$model->hasErrors()) {
                    throw new ServerErrorHttpException('Failed to create the object for unknown reason.');
                }
                $transaction->commit();
            } catch(\Exception $e) {
                $transaction->rollBack();
                throw $e;
            }
        }
        return $model;
    }

    /**
     * Get permissions for entity
     * @param $entity
     * @param $id
     * @return \yii\rbac\Permission[]
     * @throws \yii\web\NotFoundHttpException
     */
    public function actionGetPermissionForEntity($entity, $id)
    {
        if ($entity == 'user') {
            return ['data' =>
                [
                    'roles' => \Yii::$app->authManager->getRolesByUser($id),
                    'permissions' => \Yii::$app->authManager->getPermissionsByUser($id)
                ]
            ];
        } elseif($entity == 'role') {
            return ['data' => \Yii::$app->authManager->getPermissionsByRole($id)];
        }
        throw new NotFoundHttpException("Object not found");
    }

    /**
     * Set permissions for entity
     * @param $entity
     * @param $id
     * @throws \yii\web\NotFoundHttpException
     * @throws \Exception
     */
    public function actionSetPermissionForEntity($entity, $id)
    {
        $authManager = \Yii::$app->authManager;
        $requestData = \Yii::$app->getRequest()->getBodyParams();

        // Manage role for user
        $transaction = AuthItem::getDb()->beginTransaction();
        try{
            if ($entity == 'user') {
                if (null === User::findOne($id)) {
                    throw new NotFoundHttpException("Object not found");
                }

                $type = !empty($requestData['type']) ? $requestData['type'] : null;
                if ($type == 'role') {
                    $listOfRoles = !empty($requestData['items']) ? $requestData['items'] : [];

                    // Check if requested roles available
                    $uniqueRoles = [];
                    foreach ($listOfRoles as $roleName) {
                        $role = $authManager->getRole($roleName);
                        if (!$role) {
                            throw new NotFoundHttpException("Invalid request");
                        }
                        if (!isset($uniqueRoles[$roleName])) {
                            $uniqueRoles[$roleName] = $role;
                        }
                    }

                    // Remove all assignments for current user
                    AuthAssignment::deleteAll(['user_id' => $id]);

                    // Add new assignments
                    foreach ($uniqueRoles as $role) {
                        $authManager->assign($role, $id);
                    }

                } elseif($type == 'permission') {
                    $listOfPermission = !empty($requestData['items']) ? $requestData['items'] : [];

                    // Check if requested permission available
                    $uniquePermissions = [];
                    foreach ($listOfPermission as $permissionName) {
                        $permission = $authManager->getPermission($permissionName);
                        if (!$permission) {
                            throw new NotFoundHttpException("Invalid request");
                        }
                        if (!isset($uniquePermissions[$permissionName])) {
                            $uniquePermissions[$permissionName] = $permission;
                        }
                    }
                    // Remove all assignments for current user
                    AuthAssignment::deleteAll(['user_id' => $id]);

                    // Add new assignments
                    foreach ($uniquePermissions as $permission) {
                        $authManager->assign($permission, $id);
                    }
                } else {
                    throw new NotFoundHttpException("Invalid found");
                }
            } elseif($entity == 'role') {
                $role = $authManager->getRole($id);
                if (!$role) {
                    throw new NotFoundHttpException("Object not found");
                }

                // manage permission for roles
                $listOfPermissions = !empty($requestData['items']) ? $requestData['items'] : [];

                // Check if requested permission available
                $uniquePermissions = [];
                foreach ($listOfPermissions as $permissionName) {
                    $permission = $authManager->getPermission($permissionName);
                    if (!$permission) {
                        throw new NotFoundHttpException("Invalid request");
                    }
                    if (!isset($uniquePermissions[$permissionName])) {
                        $uniquePermissions[$permissionName] = $permission;
                    }
                }

                // Remove all assignments for current user
                $authManager->removeChildren($role);

                // Add new assignments
                foreach ($uniquePermissions as $permission) {
                    $authManager->addChild($role, $permission);
                }
            } else {
                throw new NotFoundHttpException("Invalid found");
            }
            $transaction->commit();
        } catch(\Exception $e) {
            $transaction->rollBack();
            throw $e;
        }
        \Yii::$app->getResponse()->setStatusCode('200');
    }
}