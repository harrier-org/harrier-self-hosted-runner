/* 
    - requires:
        - PAT from the aws secrets manager or the aws .env file or config object
        - 

    - create lambda that receives webhook (queued, inprogress, completed) from github workflow run
    - deploy lambda

    - create rest API (resources, methods, integrations, resource policy)
    - register api with api gateway (stages, deployment)
    - setup github webhook with rest api's url as the webhook payload_url
  */

import createAndDeployLambda from "../utils/aws/lambda/createAndDeployLambda";

import createMethod from "../utils/aws/api/createMethod";
import createResource from "../utils/aws/api/createResource";
import createRestApi from "../utils/aws/api/createRestAPI";

import getLambdaArn from "../utils/aws/lambda/getLambdaArn";
import grantInvokePermission from "../utils/aws/iam/grantInvokePermission";

// import setupWebhook from "../utils/github/setupWebhook";

export const setupWorkflowWebhook = async function () {
  const lambdaName = "test_lambda";

  try {
    await createAndDeployLambda(lambdaName);
    console.log("lambda created and deployed");

    const restApiId = await createRestApi();
    const resourceId = await createResource(restApiId);
    await createMethod(restApiId, resourceId);
    // TODO: create resource policy on the rest api (limit to github webhook ip ranges)
    console.log("rest api created");

    const lambdaArn = await getLambdaArn(lambdaName);
    await grantInvokePermission(lambdaArn, restApiId); // ASK JESSE ABOUT S3 CLEANUP LAMBDA PERMISSIONS

    console.log("lambda execution permissions granted to rest api");

    console.log("register api with api gateway (stages, deployment)");
    console.log(
      'setup github webhook with rest api"s url as the webhook payload_url'
    );

    // await setupWebhook("payload_url");
  } catch (error: unknown) {
    console.error("Error executing setupWorkflowWebhook: ", error);
  }
};

void setupWorkflowWebhook();