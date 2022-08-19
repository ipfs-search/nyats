import jestOpenAPI from "jest-openapi";
import request from "supertest";
import path from "path";

import app from "../app.js";

// Not sure why .default here is necessary.
jestOpenAPI.default(path.resolve("openapi.yml"));

describe("GET IPFS thumbnail", () => {
  it("Should satisfy OpenAPI spec", async () => {
    const res = await request(app).get(
      "/thumbnail/ipfs/QmcRD4wkPPi6dig81r5sLj9Zm1gDCL4zgpEj9CfuRrGbzF/200/200"
    );

    expect(res).toSatisfyApiSpec();
  });
});
