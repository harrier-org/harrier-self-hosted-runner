import {
  EC2Client,
  RunInstancesCommand,
  RunInstancesCommandInput,
  TagSpecification,
  // _InstanceType,
} from "@aws-sdk/client-ec2";

import { configHarrier } from "../../../config/configHarrier";
import { getStartScript } from "../../../scripts/setup";

export const createEC2 = async (poolId: number) => {
  const client = new EC2Client({ region: configHarrier.region });

  const amiId = configHarrier.imageId;
  const instanceType = configHarrier.instanceType;
  // const keyName = configHarrier.keyName; // dev only, no keyName for prod
  const minCount = configHarrier.minInstanceCount;
  const maxCount = configHarrier.maxInstanceCount;
  const securityGroupIds = configHarrier.securityGroupIds;
  const subnetId = configHarrier.subnetId;
  // const iamInstanceProfile = {
  //   Arn: configHarrier.runnerInstanceServiceRoleArn,
  // };
  const tagSpecifications: TagSpecification[] = [
    {
      ResourceType: "instance",
      Tags: [
        { Key: "Name", Value: `${configHarrier.tagValue}-ec2-${poolId}` },
        { Key: "Agent", Value: "Harrier-Runner" },
      ],
    },
  ];

  const userDataScript = getStartScript();

  // Encode the script in base64 as required by AWS
  const userData = Buffer.from(userDataScript).toString("base64");

  const params: RunInstancesCommandInput = {
    ImageId: amiId, // AMI ID for the instance
    InstanceType: instanceType, // EC2 instance type
    // KeyName: keyName, // dev only, no keyName for prod
    MinCount: minCount, // Minimum instances to launch
    MaxCount: maxCount, // Maximum instances to launch
    BlockDeviceMappings: [
      {
        DeviceName: "/dev/sda1",
        Ebs: {
          VolumeSize: 16, // Size of the volume in GB
          VolumeType: "gp3",
        },
      },
    ],
    SecurityGroupIds: securityGroupIds, // Security group IDs
    SubnetId: subnetId, // Subnet ID (optional)
    IamInstanceProfile: {
      Name: configHarrier.runnerInstanceProfileName,
    }, // IAM resource profile
    TagSpecifications: tagSpecifications, // Instance tags
    UserData: userData, // UserData (must be base64 encoded)
  };

  const runInstancesCommand = new RunInstancesCommand(params);

  try {
    const instanceData = await client.send(runInstancesCommand);

    let instanceId = "";
    if (instanceData.Instances && instanceData.Instances[0].InstanceId) {
      instanceId = instanceData.Instances[0].InstanceId;
    }

    console.log(`✅ Successfully created instance with ID: ${instanceId}\n`);
    return instanceId;
  } catch (error) {
    throw new Error(`❌ Error creating EC2 instance: ${error}`);
  }
};
