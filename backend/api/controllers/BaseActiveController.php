<?php
namespace api\controllers;

use yii\rest\ActiveController,
    yii\filters\auth\HttpBearerAuth,
    yii\filters\AccessControl;

class BaseActiveController extends ActiveController
{
    /**
     * Serialize answer
     * @var array
     */
    public $serializer = [
        'class' => 'yii\rest\Serializer',
        'collectionEnvelope' => 'data',
    ];

    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        return array_merge(parent::behaviors(), [
            'authenticator' => [
                'class' => HttpBearerAuth::className(),
                'except' => ['options']
            ],
            'corsFilter' => [
                'class' => \yii\filters\Cors::className(),
                'cors' => [
                    'Origin' => ['*'],
                    'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
                    'Access-Control-Request-Headers' => ['*'],
                    'Access-Control-Allow-Credentials' => null,
                    'Access-Control-Max-Age' => 86400,
                    'Access-Control-Expose-Headers' => []],
            ],
            'access' => [
                'class' => AccessControl::className(),
                'rules' => [
                    [
                        'actions' => ['options'],
                        'allow'   => true,
                    ],
                    [
                        'allow'   => true,
                        'roles' => ['viewAll'],
                    ]
                ],
            ],
        ]);
    }
}