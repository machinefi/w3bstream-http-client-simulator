import path from "path";
import fs from "fs";
import { AxiosResponse } from "axios";

import { Simulator, NoDataPointGeneratorError } from ".";
import { DataPointGenerator } from "../DataPointGenerator";
import { DataPoint, W3bStreamMessage } from "./../types";

jest.mock("w3bstream-client-js", () => {
  return {
    W3bstreamClient: jest.fn().mockImplementation(() => {
      return {
        publish: jest.fn().mockImplementation((): Partial<AxiosResponse> => {
          return {
            status: 200,
            statusText: "OK",
            data: {},
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

describe("simulator", () => {
  describe("initialize", () => {
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
    let dataGenerator: DataPointGenerator<TemperatureDataPoint>;
    let message1: W3bStreamMessage;

    beforeEach(() => {
      simulator1 = new Simulator(PUB_TOKEN_1, W3BSTREAM_ENDPOINT);
      simulator1.init();

      dataGenerator = new DataPointGenerator<TemperatureDataPoint>(() => ({
        temperature: DataPointGenerator.randomizer(0, 100),
        timestamp: DataPointGenerator.timestampGenerator(),
      }));

      simulator1.dataPointGenerator = dataGenerator;

      message1 = simulator1.generateSingleMessage();
    });
    afterEach(() => {
      fs.rmSync(path.join("./", "private.key"), { force: true });
    });
    it("should generate a data point", () => {
      const dataPoint = message1.data as TemperatureDataPoint;

      expect(dataPoint.temperature).toBeGreaterThanOrEqual(0);
      expect(dataPoint.temperature).toBeLessThanOrEqual(100);

      expect(dataPoint.timestamp).toBeGreaterThan(Date.now() - 1000);
    });
    it("should generate two different data points", () => {
      const message2 = simulator1.generateSingleMessage();

      const dataPoint1 = message1.data as TemperatureDataPoint;
      const dataPoint2 = message2.data as TemperatureDataPoint;

      expect(dataPoint1.temperature).toBeDefined();
      expect(dataPoint2.temperature).toBeDefined();
      expect(dataPoint1.temperature).not.toEqual(dataPoint2.temperature);
    });
    it("should generate a payload with a signature", () => {
      expect(message1.signature.length).toBeGreaterThan(0);
    });
    it("should throw if no data generator is set", () => {
      const simulator2 = new Simulator(PUB_TOKEN_2, W3BSTREAM_ENDPOINT);
      simulator2.init();
      expect(() => simulator2.generateSingleMessage()).toThrow(
        NoDataPointGeneratorError
      );
    });
  });

  describe("simulation", () => {
    let dataGenerator: DataPointGenerator<TemperatureDataPoint>;

    beforeEach(() => {
      simulator1 = new Simulator(PUB_TOKEN_1, W3BSTREAM_ENDPOINT);
      simulator1.init();

      dataGenerator = new DataPointGenerator<TemperatureDataPoint>(() => ({
        temperature: DataPointGenerator.randomizer(0, 100),
        timestamp: DataPointGenerator.timestampGenerator(),
      }));

      simulator1.dataPointGenerator = dataGenerator;
    });
    it("should power on", async () => {
      simulator1.powerOn(1);

      jest.spyOn(simulator1, "sendSingleMessage");

      await new Promise((resolve) => setTimeout(resolve, 1_000));

      expect(simulator1.sendSingleMessage).toHaveBeenCalledTimes(1);

      await new Promise((resolve) => setTimeout(resolve, 1_000));

      expect(simulator1.sendSingleMessage).toHaveBeenCalledTimes(2);

      simulator1.powerOff();
    });
  });
});
