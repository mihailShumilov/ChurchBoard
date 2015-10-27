<?php

namespace app\modules\v1\controllers;

use api\controllers\BaseActiveController,
    common\models\User,
    yii\filters\AccessControl,
    yii\filters\auth\HttpBearerAuth;

class UserController extends BaseActiveController
{
    public $modelClass = 'common\models\User';

    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        return array_merge(parent::behaviors(), [
            'authenticator' => [
                'class' => HttpBearerAuth::className(),
                'except' => ['login', 'create', 'options']
            ],
            'access' => [
                'class' => AccessControl::className(),
                'rules' => [
                    [
                        'actions' => ['login', 'create', 'options'],
                        'allow'   => true,
                        'roles' => ['?']
                    ],
                    [
                        'allow'   => true,
                        'roles' => ['viewAll'],
                    ]
                ],
            ],
        ]);
    }

    /**
     * @inheritdoc
     */
    public function actions()
    {
        return array_merge(parent::actions(), [
            'create' => [
                'class' => 'yii\rest\CreateAction',
                'modelClass' => $this->modelClass,
                'checkAccess' => [$this, 'checkAccess'],
                'scenario' => User::SCENARIO_REGISTER,
            ],
            'delete' => [
                'class' => 'api\controllers\actions\DeleteAction',
                'modelClass' => $this->modelClass,
                'checkAccess' => [$this, 'checkAccess'],
            ],
        ]);
    }

    /**
     * Login action
     * @return array
     * @throws \yii\web\HttpException
     */
    public function actionLogin()
    {
        // Check if user exist
        $user = User::findOne(['email' => \Yii::$app->getRequest()->post('email')]);
        if (!$user) {
            \Yii::$app->getResponse()->setStatusCode('422', 'Data Validation Failed.');
            return [
                ['field' => 'password', 'message' => 'Incorrect username or password.']
            ];
        }

        // Set scenation login
        $user->scenario = 'login';

        // Set password value from post request
        $user->password = \Yii::$app->getRequest()->post('password');

        // Validate user model
        if (!$user->validate()){
            $errors = [];
            foreach($user->getErrors() as $field => $message){
                $errors[] = ['field' => $field, 'message' => implode($message)];
            }
            \Yii::$app->getResponse()->setStatusCode('422', 'Data Validation Failed.');
            return $errors;
        }

        // Set response
        return [
            'access_token' => $user->access_token,
            'user_id' => $user->id,
        ];
    }

    /**
     * Get permissions for current user
     * @return array
     */
    public function actionGetPermissions()
    {
        $authHeader = \Yii::$app->getRequest()->getHeaders()->get('Authorization');
        $listOfUserPermission = [];

        if ($authHeader !== null && preg_match("/^Bearer\\s+(.*?)$/", $authHeader, $matches)) {
            $user = User::findIdentityByAccessToken($matches[1]);
            if ($user) {
                $listOfUserPermission = \Yii::$app->authManager->getPermissionsByUser($user->id);
            }
        }
        return ['data' => $listOfUserPermission];
    }

}
