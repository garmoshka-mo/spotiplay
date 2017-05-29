(() => {
  spoti.service('Report',
                      ['$q', Constructor]);
  function Constructor($q) {

    this.build = (promised_tracks) => {
      var deferred = $q.defer();

      promised_tracks.then((tracks) => {
        console.log('tracks', tracks);
      });

      return deferred.promise;
    }

  }

})();
