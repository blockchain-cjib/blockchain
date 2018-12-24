/*
# Copyright IBM Corp. All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
*/

const shim = require('fabric-shim');
const util = require('util');

var Chaincode = class {

  // Initialize the chaincode
  async Init(stub) {
    console.info('Init chaincode');
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let args = ret.params;

    try {
      return shim.success();
    } catch (err) {
      return shim.error(err);
    }
  }

  async Invoke(stub) {

    // Extract the function and args from the transaction proposal
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];

    if (!method) {
      console.log('no method of name:' + ret.fcn + ' found');
      return shim.success();
    }

    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async setCitizen(stub, args) {

  }

  async getCitizen(stub, args) {

  }

  async deleteCitizen(stub, args) {

  }
};

shim.start(new Chaincode());
