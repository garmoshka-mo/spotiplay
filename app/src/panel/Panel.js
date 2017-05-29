(function(){
    'use strict';

    spoti.controller('PanelController',
                     ['$scope', 'Music', 'Queue', '$location', 'Tabs', Controller]);
    function Controller($scope, Music, Queue, $location, Tabs) {

        var preloading = true;
        $scope.tabs = Tabs.tabs;
        $scope.state = Tabs.state;
        $scope.current_tab = {name: null};

        if (!user_id) {
            $location.path('/');
            return;
        }

        $scope.music = Music;


        $scope.refresh = function () {
          Music.reload().then(function(){
                log('reloading finished');
          });
        };

        $scope.loadMore = function() {
            $scope.current_tab.filter.limit = parseInt($scope.current_tab.filter.limit) + 100;
        };
        $scope.resetTheOnlyTrack = function() {
            $scope.current_tab.filter.the_only_track = false;
        };

        $scope.$watch('state.selectedIndex', (selectedIndex) => {
            if (preloading) return;
            loadTab(selectedIndex);
        });

        setTimeout(function() {
            Music.reload().then(function() {
                preloading = false;
                loadTab(0);
                 $('#content').show();
                 $('#preloader').hide();
            });
        }, 300);


        function loadTab(i) {
            $scope.current_tab = Tabs.select(i);
        }

    }
})();