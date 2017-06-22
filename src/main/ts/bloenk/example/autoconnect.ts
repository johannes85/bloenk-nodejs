import { Device, Color } from '../../lib';

async function main() {
  let bloenk = new Device(5824, 1500);

  bloenk.on('opened', async () => {
    console.log('Led count: ' + bloenk.getLedCount());
    await bloenk.setColorAll(new Color(10, 0, 0));
    await bloenk.writeOut();
  });
  bloenk.on('closed', async () => {
    console.log('closed');
  });

  await bloenk.open(true);
}
main();
