(() => {
  spoti.service('Report',
              ['$q', 'oauth', Constructor]);
  function Constructor($q, oauth) {

    var self = this;

    this.build = (promisedTracks) => {
      return promisedTracks
        .then(loadTracksData)
        .then(formReport);
    };

    function loadTracksData(tracks){
      let ids = tracks
        .filter((track) => track.is_local == "false")
        .map((track) => track.id);

      self.totalTracks = ids.length;
      const TRACKS_PER_REQUEST = 50;
      let promises = [];
      while (ids.length > 0) {
        promises.push(
          ajaxQuery(ids.splice(0, TRACKS_PER_REQUEST))
        );
      }
      return $q.all(promises);
    }

    function ajaxQuery(ids) {
      return oauth.ajaxPromise({
        type: "GET",
        url: `https://api.spotify.com/v1/tracks/?ids=${ids}`
      });
    }

    function formReport(dataPortions) {
      let countries = {}, report = [];

      dataPortions.each((tracksData) =>
        tracksData.tracks.each((track) => {
          track.available_markets.each((country) => {
            if (!countries[country])
              countries[country] |= 0;
            countries[country] += 1;
          })
        })
      );

      Object.keys(countries).each((country) => {
        report.push({
          name: country,
          tracks: countries[country],
          totalTracks: self.totalTracks
        });
      });

      return report;
    }

  }

})();
