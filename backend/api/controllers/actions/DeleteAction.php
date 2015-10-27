<?php

namespace api\controllers\actions;

use Yii;
use yii\rest\Action;
use yii\web\ServerErrorHttpException;

/**
 * DeleteAction implements the API endpoint for deleting a model.
 *
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class DeleteAction extends Action
{
    /**
     * Deletes a model.
     * @param mixed $id id of the model to be deleted.
     * @throws ServerErrorHttpException on failure.
     */
    public function run($id)
    {
        $model = $this->findModel($id);

        if ($this->checkAccess) {
            call_user_func($this->checkAccess, $this->id, $model);
        }
        if (!$model) {
            throw new ServerErrorHttpException('Failed to delete the object for unknown reason.');
        } else {
            $model->is_deleted = 1;
            if (!$model->save()) {
                throw new ServerErrorHttpException('Failed to delete the object for unknown reason.');
            }
        }
        Yii::$app->getResponse()->setStatusCode(204);
    }
}