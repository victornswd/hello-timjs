var container = document.getElementById('color-container');
var themeColor = document.head.querySelector('meta[name="theme-color"]');
var setter = document.getElementById('color-setter');

function stringToColor(str) {
    // str to hash
    for (var i = 0, hash = 0; i < str.length; hash = str.charCodeAt(i++) + ((hash << 5) - hash));

    // int/hash to hex
    for (var i = 0, color = "#"; i < 3; color += ("00" + ((hash >> i++ * 8) & 0xFF).toString(16)).slice(-2));

    return color;
}

function greetings(event) {
  localforage.setItem('savedName', event.target[0].value);
  window.greet(event)
}

function alertName(e) { alert('hello, ' + e.target[0].value + '!'); }
window.greet = alertName;

function setValue() {
  localforage.getItem('savedName').then(function (key) {
    var name = 'tim.js';
    if (key) {
      name = key;
    } else {
      localforage.setItem('savedName', name);
    }

    setter.value = name;
    var startValue = stringToColor(setter.value);

    container.style.backgroundColor = startValue;
    themeColor.content = startValue;

    console.timeEnd('get value from IndexedDB')
  });
}
console.time('get value from IndexedDB');
setValue();

setter.addEventListener('keyup', function(e) {
  var newColor = stringToColor(e.target.value);

  container.style.backgroundColor = newColor;
  themeColor.content = newColor;
}, false);

