MetronicApp.service('AccessService', [function() {
    return {
        userAccessRights: null,
        accessRight: [
            'inventory:create',
            'inventory:delete',
            'inventory:list',
            'inventory:update',
            'inventory:view',
            'point:create',
            'point:delete',
            'point:list',
            'point:update',
            'point:view',
            'reservation:create',
            'reservation:delete',
            'reservation:list',
            'reservation:update',
            'reservation:view',
            'resort:create',
            'resort:delete',
            'resort:list',
            'resort:update',
            'resort:view',
            'resort_network:create',
            'resort_network:delete',
            'resort_network:list',
            'resort_network:update',
            'resort_network:view',
            'user:create',
            'user:delete',
            'user:list',
            'user:update',
            'user:view'
        ],
        isAllowed: function (rule) {
            for (var right in this.userAccessRights) {
                if(right == rule) return true;
            }
            return false;
        }
    }
}]);