import * as usb from 'usb';
import { EventEmitter } from 'events';
import Color from './Color';

const CUSTOM_RQ_SET_CURRENT_LED = 0;
const CUSTOM_RQ_SET_COLOR_R = 1;
const CUSTOM_RQ_SET_COLOR_G = 2;
const CUSTOM_RQ_SET_COLOR_B = 3;
const CUSTOM_RQ_WRITE_TO_LEDS = 4;
const CUSTOM_RQ_SET_LEDCOUNT = 10;
const CUSTOM_RQ_GET_LEDCOUNT = 20;

export default class Device extends EventEmitter {

  private device: usb.Device = null;
  private ledCount: number;
  private busyCount: number;

  constructor(private vid: number, private pid: number) {
    super();
  }

  public isOpened(): boolean {
    return this.device != null;
  }

  public async open(autoOpen: boolean = false): Promise<boolean> {
    let found: usb.Device = usb.findByIds(this.vid, this.pid);
    if (!found) {
      Promise.resolve(false);
    }
    if (autoOpen) {
      this.attachUsbListeners();
    }
    return this.openDevice(found);
  }

  public close(disableAutoOpen: boolean = true): void {
    if (this.isBusy) {
      this.once('idle', () => {
        this.close(disableAutoOpen);
      });
      return;
    }
    this.device.close();
    this.device = null;
    if (disableAutoOpen) {
      this.detachUsbListeners();
    }
  }

  public async writeOut(): Promise<void> {
    await this.write(CUSTOM_RQ_WRITE_TO_LEDS, 0);
  }

  public async setColor(ledNumber: number, color: Color): Promise<void> {
    await this.write(CUSTOM_RQ_SET_CURRENT_LED, ledNumber);
    await this.write(CUSTOM_RQ_SET_COLOR_R, color.r);
    await this.write(CUSTOM_RQ_SET_COLOR_G, color.g);
    await this.write(CUSTOM_RQ_SET_COLOR_B, color.b);
  }

  public async setColorAll(color: Color): Promise<void> {
    for (let a = 0; a < this.ledCount; a++) {
      await this.setColor(a, color);
    }
  }

  public getLedCount(): number {
    return this.ledCount;
  }

  private async readLedCount(): Promise<number> {
    let ret: Buffer = await this.read(CUSTOM_RQ_GET_LEDCOUNT, 1);
    return ret[0];
  }

  private async openDevice(device: usb.Device): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.busyCount = 0;
      this.device = device;
      this.device.open();
      this.readLedCount().then((count: number) => {
        this.ledCount = count;
        this.emit('opened');
        resolve(true);
      });
    });
  }

  private async write(request: number, value: number) {
    return new Promise<void>((resolve, reject) => {
      if (!this.isOpened()) {
        reject('Device isn\'t opened');
      }
      this.increaseBusyCount();
      this.device.controlTransfer(
        usb.LIBUSB_REQUEST_TYPE_VENDOR | usb.LIBUSB_RECIPIENT_DEVICE | usb.LIBUSB_ENDPOINT_OUT,
        request,
        value,
        0,
        new Buffer(4),
        (error, buff) => {
          this.decreaseBusyCount();
          if (error) {
            //console.warn('Error while writing request '+request+' with value '+value);
            //console.warn(error);
            resolve();
          } else {
            resolve();
          }
        }
      );
    });
  }

  private async read(request: number, readLength: number): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      if (!this.isOpened()) {
        reject('Device isn\'t opened');
      }
      this.increaseBusyCount();
      this.device.controlTransfer(
        usb.LIBUSB_REQUEST_TYPE_VENDOR | usb.LIBUSB_RECIPIENT_DEVICE | usb.LIBUSB_ENDPOINT_IN,
        request,
        0,
        0,
        readLength,
        (error: any, buff: Buffer) => {
          this.decreaseBusyCount();
          if (error) {
            console.error('Error while reading');
            console.error(error);
            reject(error);
          } else {
            resolve(buff);
          }
        }
      );
    });
  }

  private isBusy(): boolean {
    return this.busyCount > 0;
  }

  private increaseBusyCount(): void {
    this.busyCount++;
    if (this.busyCount == 1) {
      this.emit('busy');
    }
  }

  private decreaseBusyCount(): void {
    if (this.busyCount > 0) {
      this.busyCount--;
      if (this.busyCount == 0) {
        this.emit('idle');
      }
    }
  }

  private detachUsbListeners(): void {
    (usb as any).removeAllListeners('attach');
    (usb as any).removeAllListeners('detach');
  }

  private attachUsbListeners(): void {
    usb.on('attach', (device: usb.Device) => {
      if (
        device.deviceDescriptor.idVendor == this.vid &&
        device.deviceDescriptor.idProduct == this.pid
      ) {
        this.openDevice(device);
      }
    });

    usb.on('detach', (device: usb.Device) => {
      if (this.device && this.device == device) {
        this.close(false);
      }
    });
  }

}