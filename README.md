# Simulator README

[![npm](https://img.shields.io/npm/v/@w3bstream/w3bstream-http-client-simulator)](https://www.npmjs.com/package/@w3bstream/w3bstream-http-client-simulator)

This README provides an overview of the Simulator module, which is designed to generate and send simulated data points to the W3BSTREAM server.

## Table of Contents

- Getting Started
- Usage
  - [Message Generator](#create-message-generator)
  - [Initialization](#simulator-initialization)
  - [Sending Messages](#sending-messages)

## Getting Started

To use the Simulator module, you need to import it along with some dependencies:

```ts
import {
  Simulator,
  DataPointGenerator,
} from "@w3bstream/w3bstream-http-client-simulator";
```

And provide DEVICE_TOKEN and HTTP_ROUTE that can be found in W3bstream project.

```ts
const apiKey = "API_KEY";
const httpRoute = "HTTP_ROUTE";
```

## Usage

### Create message generator

Deside what the shape of the data point should be:

```ts
type TemperatureDataPoint = {
  temperature: number;
  timestamp: number;
};
```

And how the data point should be generated, you can use `randomizer` or `timestampGenerator` methods of DataPointGenerator:

```ts
const generatorFunction = () => ({
  temperature: DataPointGenerator.randomizer(0, 100),
  timestamp: DataPointGenerator.timestampGenerator(),
});
```

And finally, to generate messages, instantiate data generator:

```ts
const dataGenerator = new DataPointGenerator<TemperatureDataPoint>(
  generatorFunction
);
```

### Simulator initialization

Create a new instance of the `Simulator` class, initialize it and set a `DataPointGenerator` that you created earlier:

```ts
const simulator = new Simulator(apiKey, httpRoute);
simulator.init();
simulator.dataPointGenerator = dataGenerator;
```

(OPTIONAL) You can also provide a `pathToPrivateKey` parameter:

```ts
simulator.init(pathToPrivateKey);
```

Now you can generate a message with a single or multiple events:

```ts
const message = simulator.generateEvents(numberOfDataPoints);
```

### Sending Messages

To send a single message to the server, call the `sendSingleMessage` method:

```ts
const eventType = "TEMPERATURE";

const { res, msg } = await simulator.sendSingleMessage(eventType);

console.log("response: ", res?.data);
console.log("w3bstream message: ", msg);
```

To send messages at a specified interval, use the `powerOn` method:

```ts
const intervalInSec = 1;
const eventType = "TEMPERATURE";

simulator.powerOn(intervalInSec, eventType);
```

To stop sending messages, call the `powerOff` method:

```ts
simulator.powerOff();
```
