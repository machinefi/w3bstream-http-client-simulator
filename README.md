# Simulator README

This README provides an overview of the Simulator module, which is designed to generate and send simulated data points to the W3BSTREAM server.

## Table of Contents

- Getting Started
- Usage
  - [Initialization](#initialization)
  - [Message Generation](#message-generation)
  - [Sending Messages](#sending-messages)

## Getting Started

To use the Simulator module, you need to import it along with some dependencies:

```javascript
import {
  Simulator,
  DataPointGenerator,
} from "@nick-iotex/w3bstream-http-client-simulator";
```

## Usage

### Initialization

Create a new instance of the `Simulator` class and initialize it:

```javascript
const simulator = new Simulator(pubId, pubToken, w3bstreamEndpoint);
simulator.init();
```

You can also provide an optional `pathToPrivateKey` parameter:

```javascript
simulator.init(pathToPrivateKey);
```

### Message Generation

Deside what the shape of the data point should be:

```javascript
type TemperatureDataPoint = {
  temperature: number;
  timestamp: number;
};
```

And how the data point should be generated, you can use `randomizer` or `timestampGenerator` methods of DataPointGenerator: 

```javascript
const generatorFunction = () => ({
  temperature: DataPointGenerator.randomizer(0, 100),
  timestamp: DataPointGenerator.timestampGenerator(),
});
```

And finally, to generate messages, instantiate data generator and set a `DataPointGenerator` for the simulator instance:

```javascript
const dataGenerator = new DataPointGenerator<TemperatureDataPoint>(
  generatorFunction
);

simulator.dataPointGenerator = dataGenerator;
```

Now you can generate a single message:

```javascript
const message = simulator.generateSingleMessage();
```

### Sending Messages

To send a single message to the server, call the `sendSingleMessage` method:

```javascript
const res = simulator.sendSingleMessage();
```

To send messages at a specified interval, use the `powerOn` method:

```javascript
simulator.powerOn(intervalInSec);
```

To stop sending messages, call the `powerOff` method:

```javascript
simulator.powerOff();
```
