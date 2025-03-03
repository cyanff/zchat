/* This file is auto-generated by SST. Do not edit. */
/* tslint:disable */
/* eslint-disable */
/* deno-fmt-ignore-file */

declare module "sst" {
  export interface Resource {
    "MyVpc": {
      "type": "sst.aws.Vpc"
    }
    "PostgresConnectionString": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "ZeroAuthSecret": {
      "type": "sst.sst.Secret"
      "value": string
    }
    "replication-bucket": {
      "name": string
      "type": "sst.aws.Bucket"
    }
    "replication-manager": {
      "service": string
      "type": "sst.aws.Service"
      "url": string
    }
    "view-syncer": {
      "service": string
      "type": "sst.aws.Service"
      "url": string
    }
  }
}
/// <reference path="sst-env.d.ts" />

import "sst"
export {}