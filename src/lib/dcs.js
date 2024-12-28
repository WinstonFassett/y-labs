import { Duplex } from 'streamx';
import { from } from 'b4a';

export default class RTCDataChannelStream extends Duplex {
  constructor(dataChannel) {
    super();

    const listen = (channel, ev, listener) => {
      channel.addEventListener(ev, listener);
    };

    const unlisten = (channel, ev, listener) => {
      channel.removeEventListener(ev, listener);
    };

    this._dataChannel = dataChannel;
    this._opening = null;
    this._sendQueue = [];

    this._onError = this._onError.bind(this);
    this._onClose = this._onClose.bind(this, unlisten);
    this._onOpen = this._onOpen.bind(this);
    this._onMessage = this._onMessage.bind(this);

    listen(this._dataChannel, 'error', this._onError);
    listen(this._dataChannel, 'close', this._onClose);
    listen(this._dataChannel, 'open', this._onOpen);
    listen(this._dataChannel, 'message', this._onMessage);
  }

  _write(data, cb) {
    if (this._dataChannel.readyState === 'open') {
      // console.log('Sending data:', data);
      this._dataChannel.send(data);
      cb(null);
    } else {
      // console.log('Queueing data:', data);
      this._sendQueue.push({ data, cb });
    }
  }

  _predestroy() {
    if (this._opening) {
      const cb = this._opening;
      this._opening = null;
      cb(new Error('DataChannel was destroyed'));
    }
  }

  _destroy(cb) {
    this._dataChannel.close();
    cb(null);
  }

  _onError(err) {
    // console.log('Data channel error:', err);
    this.destroy(err);
  }

  _onClose(unlisten) {
    unlisten(this._dataChannel, 'error', this._onError);
    unlisten(this._dataChannel, 'close', this._onClose);
    // console.log('Data channel closed');
    this.destroy(new Error('DataChannel closed'));
  }

  _onOpen() {
    // console.log('Data channel opened')
    while (this._sendQueue.length > 0) {
      const { data, cb } = this._sendQueue.shift()
      if (this._dataChannel.readyState === 'open') {
        // console.log('Sending data:', data)
        this._dataChannel.send(data)
        cb(null)
      } else {
        // console.log('Data channel not open, re-queueing data')
        this._sendQueue.unshift({ data, cb })
        break
      }
    }
  }

  _onMessage(event) {
    // console.log('Received message:', event.data);
    // this.push(buffer.from(event.data));
    this.push(from(event.data));
  }

  destroy(err) {
    if (this._destroying) return;
    this._destroying = true;
    this._predestroy();
    this._destroy(() => {
      if (err) console.error(err);
    });
  }
}
