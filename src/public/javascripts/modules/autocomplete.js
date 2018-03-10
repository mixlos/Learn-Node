function autocomplete() {
  const input = document.querySelector('#address');
  if (!input) {
    return;
  }
  const latInput = document.querySelector('#lat');
  const lngInput = document.querySelector('#lng');
  const dropdown = new google.maps.places.Autocomplete(input);
  dropdown.addListener('place_changed', () => {
    const place = dropdown.getPlace();
    latInput.value = place.geometry.location.lat();
    lngInput.value = place.geometry.location.lng();
  });
  input.addEventListener('keydown', e => {
    if (e.keyCode === 13) {
      e.preventDefault();
    }
  });
}

export default autocomplete;
