import { Device, Color } from '../../lib';

async function main() {
  let bloenk = new Device(5824, 1500);
  await bloenk.open(false);
  await bloenk.setColorAll(new Color(10, 0, 20));
  await bloenk.writeOut();
}
main();
