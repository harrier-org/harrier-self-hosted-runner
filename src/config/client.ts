/* 
    - creating a basic `config` object that is used throughout the app by all aws-clients
    export const config = { credentials: }
  */

import "dotenv/config";

import { fromEnv } from "@aws-sdk/credential-providers";

export const config = {
  credentials: fromEnv(), // Load credentials from environment variables
  region: process.env.AWS_REGION,
};