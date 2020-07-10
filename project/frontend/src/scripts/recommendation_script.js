export default function getRecommendation(preferences) {
  const promises = makePromisesArray(preferences);

  Promise.all(promises)
    // This gives us the list of restaurants.
    .then((responses) =>
      Promise.all(responses.map((response) => response.json()))
    )
    .then((data) => {
      let restaurants = [];
      for (const restaurant of data) {
        restaurants = restaurants.concat(restaurant.results);
      }

      fetch('/api/recommendation', {
        method: 'POST',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurants,
          preferences,
        }),
      })
        .then((response) => response.text())
        .then((data) => {
          try {
            const selections = JSON.parse(data);
            console.log(selections);
          } catch (err) {
            console.log(err);
          }
        });
    });
}

/**
 *  Returns an array of promises of calls to the Google Places API.
 *  One promise is created for every cuisine type.
 *  If no cuisines are specified, only one promise is created.
 */
function makePromisesArray(preferences) {
  const { cuisine, radius, currLocation, open } = preferences;
  // TODO: replace API key
  const apiKey = 'AIzaSyBBqtlu5Y3Og7lzC1WI9SFHZr2gJ4iDdTc';
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  const textSearchBaseUrl =
    'https://maps.googleapis.com/maps/api/place/textsearch/json?';
  const promises = [];
  const cuisineTypes = cuisine;
  // Make sure we still create a promise even if no cuisine type is specified.
  // This will make the text search query just "restaurant" without specifying a cuisine.
  if (cuisineTypes.length === 0) {
    cuisineTypes.push('');
  }
  for (const cuisineType of cuisineTypes) {
    const searchParams = new URLSearchParams();
    searchParams.append('query', cuisineType + 'restaurant');
    searchParams.append('location', currLocation.lat + ',' + currLocation.lng);
    if (radius.pref) {
      searchParams.append('radius', milesToMeters(radius.pref));
    }
    if (open) {
      searchParams.append('opennow', open);
    }
    searchParams.append('key', apiKey);
    promises.push(fetch(proxyUrl + textSearchBaseUrl + searchParams));
  }
  return promises;
}

function milesToMeters(numMiles) {
  return numMiles * 1609.34;
}