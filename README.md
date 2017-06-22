## Blönk USB RGB Notifier Node.js Library

### Installation

#### Install Driver
Use Zadig (http://zadig.akeo.ie/) to install the "WinUSB" driver for the "Bloenk" device.

#### Install Library
```bash
npm install bloenk --save
```

### Examples

#### Typescript
```typescript
import { Device, Color } from 'bloenk';

(async () => {
  let dev = new Device(5824, 1500);
  await dev.open(false);
  console.log('Led count = '+dev.getLedCount())
  await dev.setColorAll(new Color(10, 20, 20));
  await dev.writeOut();
})();
```

#### Plain JavaScript
```javascript
let bloenk = require('bloenk');
let dev = new bloenk.Device(5824, 1500);
dev.open().then(() => {
  console.log('Led count = '+dev.getLedCount());
  return dev.setColorAll(new bloenk.Color(0, 50, 50))
}).then(() => {
  dev.writeOut();
});
```
