# backend-signal

Beep backend handling WebRTC signaling.

## Quickstart

Docker:

```bash
export PORT=1837 # Or whatever port number you like
docker build -t backend-signal . && docker run -it backend-signal
```

Not hipster (requires node.js):

```bash
export PORT=1837 # Or whatever port number you like
npm install
node index.js
```

## API

Unless otherwise noted, bodies and responses are with ```Content-Type: application/json```.

| Contents |
| -------- |
| [Subscribe to SSE](#Subscribe-to-SSE) |
| [Get a user's devices](#Get-a-user's-devices) |
| [Post data to a user's device](#Post-data-to-a-user's-device) |

### Subscribe to SSE

```
GET /subscribe/:user/device/:device
```

Subscribe a user's device to the signaling service. Recommended usage:

```js
const es = new EventSource(`${host}/subscribe/${user}/device/${device}`);
es.onmessage = (e) => {
  const data = e.data;
  // Do whatever with data
};
```

#### URL Params

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| user | String | User's ID. | ✓ |
| device | String | Device's ID. Must be unique to the device. I suggest something based on MAC address. | ✓ |

#### Success Response (200 OK)

An [EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource) stream.

---

### Get a user's devices

```
GET /user/:user/devices
```

Get a list of device IDs associated with the specified user. One can then use the IDs to post data to individual devices.

#### URL Params

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| user | String | Target user's ID. | ✓ |

#### Success Response (200 OK)

List of device IDs. Can be an empty list.

```
[ <id>, <id2>, ... ]
```

---

### Post data to a user's device

```
POST /user/:user/device/:device
```

Post data to the specified device of the specified user.

#### URL Params

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| user | String | Target user's ID. | ✓ |
| device | String | Target device's ID. | ✓ |

#### Body

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| data | String | Data to be sent. | ✓ |

#### Success Response (200 OK)

Empty body.

#### Errors

| Code | Description |
| ---- | ----------- |
| 400 | No data to be sent was supplied. |
| 404 | The specified user/device's connection could not be found. |
