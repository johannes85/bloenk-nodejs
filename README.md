## Blönk USB RGB Notifier Node.js Library

### Examples

#### Installation
```bash
npm install bloenk --save
```

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

#### Plain js
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
