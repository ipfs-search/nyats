/////
// Setup testing infra
////
import { use, expect } from "chai";
import request from "supertest";
import path from "path";

// Testdouble
import * as td from "testdouble";
import tdChai from "testdouble-chai";
use(tdChai(td));

// OpenAPI matcher
import { chaiPlugin as matchApiSchema } from "api-contract-validator";
const apiDefinitionsPath = path.resolve("openapi.yml");
use(matchApiSchema({ apiDefinitionsPath }));

import makeApp from "../app.js";

// // Not sure why .default here is necessary.
// jestOpenAPI.default();

// // let statMock = jest.fn(() => Promise.reject());
// let versionMock = jest.fn(() => Promise.resolve({ version: "0.99.0" }));
// // jest.mock("ipfs-http-client", () => {
// //   create: function () {
// //     return {
// //       version: versionMock,
// //       files: {
// //         stat: statMock,
// //       },
// //     };
// //   },
// // });

// // const createMock = jest.fn();
// jest.mock("ipfs-http-client");

// create.mockImplementation(() => {
//   console.log("go to hell");
// });

let ipfsMock;
describe("GET IPFS thumbnail", () => {
  beforeEach(() => {
    ipfsMock = await td.replace("ipfs-http-client", () => {
      version: () => Promise.resolve({ version: "0.99.0" })
    });
  });
  afterEach(() => {
    td.reset();
  });

  it("Should satisfy OpenAPI spec", async () => {
    // const versionMock = jest.fn(() => Promise.resolve({ version: "0.99.0" }));
    // create.mockReturnValue({
    //   version: versionMock,
    // });
    // statMock.mockReturnValue(Promise.reject());
    const app = request(await makeApp());
    const response = await app.get(
      "/thumbnail/ipfs/QmcRD4wkPPi6dig81r5sLj9Zm1gDCL4zgpEj9CfuRrGbzF/200/200"
    );

    expect(response).to.have.status(200).and.to.matchApiSchema();
  });
});
