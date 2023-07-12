import path from "path";
import fs from "fs";

import { Simulator } from ".";
import { DataPointGenerator } from "../DataPointGenerator";
import { DataPoint } from "./../types";

jest.mock("w3bstream-client-js", () => {
  return {
    W3bstreamClient: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn().mockImplementation(() => {
          return {
            res: true,
            msg: "message sent",
          };
        }),
      };
    }),
  };
});

const movePkFile = (oldPath: string, newPath: string): void => {
  const newPKFile = fs.readFileSync(path.join(oldPath, "private.key"));
  fs.mkdirSync(newPath, { recursive: true });
  fs.writeFileSync(path.join(newPath, "private.key"), newPKFile);
};

const removePkFile = (path: string): void => {
  fs.rmSync(path, { recursive: true, force: true });

  const testingSimulatorPath = path.split("/").slice(0, -1).join("/");
  const isEmpty = fs.readdirSync(testingSimulatorPath).length === 0;

  if (isEmpty) {
    fs.rmdirSync(testingSimulatorPath);
  }
};


const PUB_TOKEN_1 = "pub_token_1";
const PUB_TOKEN_2 = "pub_token_2";
const W3BSTREAM_ENDPOINT = "http://localhost:3000";

let simulator1: Simulator;
let simulator2: Simulator;

let publicKey1: string;
let publicKey2: string;

interface TemperatureDataPoint extends DataPoint {
  temperature: number;
}

describe("Simulator", () => {
  describe("Initialization", () => {
    beforeEach(() => {
      simulator1 = new Simulator(PUB_TOKEN_1, W3BSTREAM_ENDPOINT);
      simulator1.init();
      publicKey1 = simulator1.publicKey;
    });
    afterEach(() => {
      fs.rmSync(path.join("./", "private.key"), { force: true });
    });
    it("should initialize", () => {
      expect(simulator1).toBeInstanceOf(Simulator);
    });
    it("should initialize from private key in file", () => {
      const newPath = "./testing-simulator1/new-path";
      movePkFile("./", newPath);

      simulator2 = new Simulator(PUB_TOKEN_2, W3BSTREAM_ENDPOINT);
      simulator2.init(newPath);

      publicKey2 = simulator2.publicKey;

      expect(publicKey1).toEqual(publicKey2);

      removePkFile(newPath);
    });
    it("should initialize if no private key is provided", () => {
      expect(publicKey1.length).toEqual(130);
    });
    it("should create new id if path to file is wrong", () => {
      simulator2 = new Simulator(PUB_TOKEN_2, W3BSTREAM_ENDPOINT);
      simulator2.init("./wrong-path");
      publicKey2 = simulator2.publicKey;

      expect(publicKey2.length).toEqual(130);
    });
    it("should create a new private.key file if none is provided", () => {
      const file = fs.readFileSync(path.join("./", "private.key"));
      const privateKey = file.toString();

      expect(privateKey.length).toEqual(64);
    });
    it("should reuse private.key file if one is provided", () => {
      simulator2 = new Simulator(PUB_TOKEN_2, W3BSTREAM_ENDPOINT);
      simulator2.init();
      publicKey2 = simulator2.publicKey;

      expect(publicKey1).toEqual(publicKey2);
    });
  });
  describe("Message generation", () => {
    beforeEach(() => {
      simulator1 = new Simulator(PUB_TOKEN_1, W3BSTREAM_ENDPOINT);
      simulator1.init();
    });
    afterEach(() => {
      fs.rmSync(path.join("./", "private.key"), { force: true });
    });
    it("should set a data generator", () => {
      const dataGenerator = new DataPointGenerator<TemperatureDataPoint>(
        () => ({
          temperature: DataPointGenerator.randomizer(0, 100),
          timestamp: DataPointGenerator.timestampGenerator(),
        })
      );
      simulator1.dataPointGenerator = dataGenerator;
    });
    it("should generate a data point", () => {
      const dataGenerator = new DataPointGenerator<TemperatureDataPoint>(
        () => ({
          temperature: DataPointGenerator.randomizer(0, 100),
          timestamp: DataPointGenerator.timestampGenerator(),
        })
      );
      simulator1.dataPointGenerator = dataGenerator;

      const message = simulator1.generateSingleMessage();
      const dataPoint = message.data as TemperatureDataPoint;

      expect(dataPoint.temperature).toBeGreaterThanOrEqual(0);
      expect(dataPoint.temperature).toBeLessThanOrEqual(100);

      expect(dataPoint.timestamp).toBeGreaterThanOrEqual(0);
    });
    it("should generate two different data points", () => {
      const dataGenerator = new DataPointGenerator<TemperatureDataPoint>(
        () => ({
          temperature: DataPointGenerator.randomizer(0, 100),
          timestamp: DataPointGenerator.timestampGenerator(),
        })
      );
      simulator1.dataPointGenerator = dataGenerator;

      const message1 = simulator1.generateSingleMessage();
      const dataPoint1 = message1.data as TemperatureDataPoint;
      const message2 = simulator1.generateSingleMessage();
      const dataPoint2 = message2.data as TemperatureDataPoint;

      expect(dataPoint1.temperature).not.toEqual(dataPoint2.temperature);
    });
    it("should generate a payload with a signature", () => {
      const dataGenerator = new DataPointGenerator<TemperatureDataPoint>(
        () => ({
          temperature: DataPointGenerator.randomizer(0, 100),
          timestamp: DataPointGenerator.timestampGenerator(),
        })
      );
      simulator1.dataPointGenerator = dataGenerator;

      const message = simulator1.generateSingleMessage();

      expect(message.signature).toBeDefined();
    });
    it("should sign a message with the private key", () => {
      const dataGenerator = new DataPointGenerator<TemperatureDataPoint>(
        () => ({
          temperature: DataPointGenerator.randomizer(0, 100),
          timestamp: DataPointGenerator.timestampGenerator(),
        })
      );
      simulator1.dataPointGenerator = dataGenerator;

      const message = simulator1.generateSingleMessage();

      const signature = message.signature;
      expect(signature.length).toBeGreaterThan(0);
    });
  });
});
