# Simulator README

This README provides an overview of the Simulator module, which is designed to generate and send simulated data points to the W3BSTREAM server.

## Table of Contents

- Getting Started
- Usage
  - Initialization
  - Message Generation
  - Sending Messages

## Getting Started

To use the Simulator module, you need to import it along with some dependencies:

```javascript
import axios from "axios";
import { Simulator } from ".";
import { DataPointGenerator } from "../DataPointGenerator";
import { Message, Payload } from "../types";
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

To generate messages, set a `DataPointGenerator` for the simulator instance:

```javascript
const dataGenerator =
  new DataPointGenerator() <
  TemperatureDataPoint >
  (() => ({
    temperature: randomizer(),
    timestamp: timestampGenerator(),
  }));
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
