import { jest } from "@jest/globals";
import jestOpenAPI from "jest-openapi";
import request from "supertest";
import path from "path";

import app from "../app.js";

// Not sure why .default here is necessary.
jestOpenAPI.default(path.resolve("openapi.yml"));

let statMock = jest.fn(() => Promise.reject());
let versionMock = jest.fn(() => Promise.resolve({ version: "0.14.0" }));
jest.mock("ipfs-http-client", {
  create: function () {
    return {
      version: versionMock,
      files: {
        stat: statMock,
      },
    };
  },
});

describe("GET IPFS thumbnail", () => {
  const rapp = request(app);

  it("Should satisfy OpenAPI spec", async () => {
    // statMock.mockReturnValue(Promise.reject());

    const res = await rapp.get(
      "/thumbnail/ipfs/QmcRD4wkPPi6dig81r5sLj9Zm1gDCL4zgpEj9CfuRrGbzF/200/200"
    );

    expect(res).toSatisfyApiSpec();
  });
});
