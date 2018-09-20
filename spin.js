// Are we busy?
var busy = false;

// The device, if we're connected
var connected = false;

// The cmd characteristic, if connected
var cmdCharacteristic = false;

// Function to call 'toggle' on the other Puck
function sendSpin() {
  if (!busy) {
    busy = true;
    if (!connected) {
      NRF.requestDevice({ filters: [{ name: 'Skoobot' }] }).then(function(device) {
        console.log("Found Skoobot");
        return device.gatt.connect();
      }).then(function(d) {
        console.log("Connected");
        connected = d;
        return d.getPrimaryService("000015231212efde1523785feabcd123");
      }).then(function(s) {
        console.log("Found Service");
        return s.getCharacteristic("000015251212efde1523785feabcd123"); 
      }).then(function(c) {
        console.log("Found command char");
        cmdCharacteristic = c;
        busy = false;
        // Now actually send the toggle command
        sendSpin();
      }).catch(function() {        
        digitalPulse(LED3, 1, 500); // light blue if we had a problem
        if (connected) connected.disconnect();
        busy = false;
        connected=false;
      });
      
      
    } else {
        console.log("Writing cmd spin right");
        cmdCharacteristic.writeValue(0x10).then(function() {
        digitalPulse(LED2, 1, 500); // light green to show it worked
        busy = false;
      }).catch(function() {
        digitalPulse(LED1, 1, 500); // light red if we had a problem
        busy = false;
      });
    }
  }
}

// Call sendToggle when the button is pressed
setWatch(sendSpin, BTN, { edge:"rising", debounce:50, repeat: true });