// connects to Mi Band and gets name value and amount of steps
document.querySelector('#connect').addEventListener('click', function() {
  MIband.connect()
  .then(() => { 
    console.log(MIband.device);
    document.querySelector('#state').classList.remove('connecting');
    document.querySelector('#state').classList.add('connected');
    return MIband.getDeviceName().then(handleDeviceName)
    .then(() => MIband.getInitialSteps().then(handleInitialSteps))
    .then(() => MIband.startNotificationsSteps().then(handleSteps));
  })  
  .catch(error => {
    console.error('Argh!', error);
  });
});

function handleDeviceName(deviceName) {
  document.querySelector('.deviceName').value = "Device Name: " + deviceName;
}

function handleInitialSteps(steps) {
  document.querySelector('.steps-amount').value = steps;
}

function handleSteps(steps) {
  steps.addEventListener('characteristicvaluechanged', event => {
    var stepsMeasurement = MIband.getSteps(event.target.value);
    document.querySelector('.steps-amount').value = stepsMeasurement;
  })
}

// service worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(function() { 
    console.log('Service Worker Registered'); 
  }).catch(function() {
    console.log('Service Worker registration failed');
  });
}
