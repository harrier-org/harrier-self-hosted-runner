import {
  IAMClient,
  CreateRoleCommand,
  PutRolePolicyCommand,
  //   GetRoleCommand,
  //   waitUntilRoleExists,
} from "@aws-sdk/client-iam";
// import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
// import { STSClient } from "@aws-sdk/client-sts";

import { configHarrier } from "../../../config/configHarrier";
import { lambdaTrustPolicy } from "../../../config/trustPolicies";
import { instanceTrustPolicy } from "../../../config/trustPolicies";
import { schedulerTrustPolicy } from "../../../config/trustPolicies";

const iamClient = new IAMClient({ region: configHarrier.region });
// const stsClient = new STSClient({ region: configHarrier.region });

export async function createLambdaServiceRole(
  roleName: string,
  policyDocument: string,
) {
  try {
    // previously, we checked if the role already existed and if so, just returned the existingRoleArn
    const arn = await createBaseRole(roleName, lambdaTrustPolicy);

    await iamClient.send(
      new PutRolePolicyCommand({
        RoleName: roleName,
        PolicyName: `${roleName}-policy`,
        PolicyDocument: policyDocument,
      }),
    );

    // previously, if the !roleExistsAndIsAssumable, throw an error
    console.log(
      `🚦 ***waiting for lambda service ${roleName} role to PROPAGATE***`,
    );
    await new Promise((res) => setTimeout(res, 10_000));
    console.log("✅ policies ATTACHED");
    return arn;
  } catch (error) {
    console.error("❌ Error in createWorkflowLambdaServiceRole ", error);
    throw new Error("❌");
  }
}

export async function createInstanceServiceRole(
  roleName: string,
  policyDocument: string,
) {
  try {
    // previously, we checked if the role already existed and if so, just returned the existingRoleArn
    const arn = await createBaseRole(roleName, instanceTrustPolicy);

    await iamClient.send(
      new PutRolePolicyCommand({
        RoleName: roleName,
        PolicyName: `${roleName}-policy`,
        PolicyDocument: policyDocument,
      }),
    );

    // previously, if the !roleExistsAndIsAssumable, throw an error
    console.log(
      `🚦 ***waiting for instance service role ${roleName} to PROPAGATE***`,
    );
    await new Promise((res) => setTimeout(res, 10_000));
    console.log("✅ policies ATTACHED");
    return arn;
  } catch (error) {
    console.error("❌ Error in createInstanceServiceRole ", error);
    throw new Error("❌");
  }
}

export async function createSchedulerServiceRole(
  roleName: string,
  policyDocument: string,
) {
  try {
    // previously, we checked if the role already existed and if so, just returned the existingRoleArn
    const arn = await createBaseRole(roleName, schedulerTrustPolicy);

    await iamClient.send(
      new PutRolePolicyCommand({
        RoleName: roleName,
        PolicyName: `${roleName}-policy`,
        PolicyDocument: policyDocument,
      }),
    );

    // previously, if the !roleExistsAndIsAssumable, throw an error
    console.log(
      `🚦 ***waiting for scheculer service ${roleName} role to PROPAGATE***`,
    );
    await new Promise((res) => setTimeout(res, 10_000));
    console.log("✅ policies ATTACHED");
    return arn;
  } catch (error) {
    console.error("❌ Error in createSchedulerServiceRole ", error);
    throw new Error("❌");
  }
}

async function createBaseRole(roleName: string, trustPolicy: string) {
  const response = await iamClient.send(
    new CreateRoleCommand({
      RoleName: roleName,
      Path: "/service-role/",
      AssumeRolePolicyDocument: trustPolicy,
    }),
  );

  if (!response.Role?.Arn) {
    throw new Error(`❌ Failed to create IAM role: ${roleName}`);
  }
  console.log(`✅ created ${roleName} `);
  return response.Role.Arn;
}