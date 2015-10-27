<?php
$params = array_merge(
    require(__DIR__ . '/../../common/config/params.php'),
    require(__DIR__ . '/../../common/config/params-local.php'),
    require(__DIR__ . '/params.php'),
    require(__DIR__ . '/params-local.php')
);

return [
    'id' => 'app-api',
    'basePath' => dirname(__DIR__),
    'controllerNamespace' => 'api\controllers',
    'bootstrap' => ['log'],
    'modules' => [
        'v1' => [
            'class' => 'app\modules\v1\Module',
        ],
    ],
    'components' => [
        'user' => [
            'identityClass' => 'common\models\User',
            'enableAutoLogin' => false,
            'enableSession' => false,
        ],
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning'],
                ],
            ],
        ],
        'errorHandler' => [
            'errorAction' => 'site/error',
        ],
        'request' => [
            'parsers' => [
                'application/json' => 'yii\web\JsonParser',
            ]
        ],
        'urlManager' => [
            'enablePrettyUrl' => true,
            'enableStrictParsing' => true,
            'showScriptName' => false,
            'rules' => [
                [
                    'class' => 'yii\rest\UrlRule',
                    'controller' => 'v1/user',
                    'extraPatterns' => [
                        'POST login' => 'login',
                        'OPTIONS login' => 'options',
                        'GET get-permissions' => 'get-permissions',
                        'OPTIONS get-permissions' => 'options',
                    ],
                ],
                [ 'class' => 'yii\rest\UrlRule',  'controller' => 'v1/resort',],
                [ 'class' => 'yii\rest\UrlRule',  'controller' => 'v1/reservation',],
                [ 'class' => 'yii\rest\UrlRule',  'controller' => 'v1/inventory',],
                [ 'class' => 'yii\rest\UrlRule',  'controller' => 'v1/point',],
                [ 'class' => 'yii\rest\UrlRule',  'controller' => 'v1/resort-network'],
                [ 'class' => 'yii\rest\UrlRule',  'controller' => 'v1/credential',
                    'patterns' => [
                        'DELETE role/<id:[-0-9a-z_:]+>' => 'delete',
                        'GET,HEAD {id}' => 'view',
                        'POST role' => 'create',
                        'OPTIONS role' => 'options',
                        'GET,HEAD' => 'index',
                        '{id}' => 'options',
                        '' => 'options'
                    ],
                    'extraPatterns' => [
                        'GET,HEAD <entity:(user|role)>/<id:[-0-9a-zA-Z_:]+>' => 'get-permission-for-entity',
                        'OPTIONS  <entity:(user|role)>/<id:[-0-9a-zA-Z_:]+>' => 'options',
                        'PUT,PATCH <entity:(user|role)>/<id:[-0-9a-zA-Z_:]+>' => 'set-permission-for-entity',
                    ],
                ]
            ],
        ]
    ],
    'params' => $params,
];
