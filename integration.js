// import { jest } from "@jest/globals";
// import jestOpenAPI from "jest-openapi";
// import request from "supertest";
// import path from "path";
// import { create } from "ipfs-http-client";

// import makeApp from "../app.js";

// // Not sure why .default here is necessary.
// jestOpenAPI.default(path.resolve("openapi.yml"));

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

describe("GET /thumbnail", () => {
  it("should satisyf OpenAPI spec", async () => {});
});

describe("app", () => {
  it("Should satisfy OpenAPI spec", async () => {
    // const versionMock = jest.fn(() => Promise.resolve({ version: "0.99.0" }));
    // create.mockReturnValue({
    //   version: versionMock,
    // });
    // statMock.mockReturnValue(Promise.reject());
    const app = request(await makeApp());

    const res = await app.get(
      "/thumbnail/ipfs/QmcRD4wkPPi6dig81r5sLj9Zm1gDCL4zgpEj9CfuRrGbzF/200/200"
    );

    expect(res).toSatisfyApiSpec();
  });
});
