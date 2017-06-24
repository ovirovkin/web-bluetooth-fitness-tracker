(function() {
  'use strict';

  const MI_SERVICE_UUID = '0000fee0-0000-1000-8000-00805f9b34fb';
  const MI_DEVICE_NAME_CHAR = '00002a00-0000-1000-8000-00805f9b34fb';
  const MI_REALTIME_STEPS_CHAR = '0000ff06-0000-1000-8000-00805f9b34fb';
  const MI_BATTERY_CHAR = '0000ff0c-0000-1000-8000-00805f9b34fb';

  class MIband {
    constructor() {
      this.device = null;
      this.server = null;
      this._characteristics = new Map();
    }

    connect() {
      return navigator.bluetooth.requestDevice({
        filters: [{ services: [MI_SERVICE_UUID] }],
        optionalServices: [0x1800, 0x180D]
      })
      .then(device => { 
        this.device = device;
        return device.gatt.connect();
      })
      .then(server => {
        this.server = server;
        return Promise.all([
          server.getPrimaryService(MI_SERVICE_UUID).then(service => {
            return Promise.all([
              this.cacheCharacteristic(service, MI_REALTIME_STEPS_CHAR),
            ])
          })
        ]);
      })
    }

    disconnect() {
      if (!this.device || !this.device.gatt) {
        return Promise.resolve();
      }
      return this.device.gatt.disconnect();
    }

    getDeviceName() {
      return this.device.gatt.getPrimaryService(0x1800)
      .then(service => service.getCharacteristic(MI_DEVICE_NAME_CHAR))
      .then(characteristic => characteristic.readValue())
      .then(data => {
        let decoder = new TextDecoder('utf-8');
        return decoder.decode(data);
      });
    }

    getInitialSteps() {
       return this.device.gatt.getPrimaryService(MI_SERVICE_UUID)
      .then(service => service.getCharacteristic(MI_REALTIME_STEPS_CHAR))
      .then(characteristic => characteristic.readValue())
      .then(data => data.getUint8(0));
    }

    getSteps(value) {
      value = value.buffer ? value : new DataView(value);
      let steps = value.getUint8(0);
      return steps;
    }

    startNotificationsSteps() {
      return this.startNotifications(MI_REALTIME_STEPS_CHAR);
    }

    startNotifications(characteristicUuid) {
      let characteristic = this._characteristics.get(characteristicUuid);
      // Returns characteristic to set up characteristicvaluechanged event
      return characteristic.startNotifications()
      .then(() => characteristic);
    }

    cacheCharacteristic(service, characteristicUuid) {
      return service.getCharacteristic(characteristicUuid)
        .then(characteristic => {
          this._characteristics.set(characteristicUuid, characteristic);
      });
    }

  }

  window.MIband = new MIband();

})();
