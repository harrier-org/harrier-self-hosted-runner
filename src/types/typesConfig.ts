export interface configHarrierType {
  tagValue: string;
  cidrBlockVPC: string;
  cidrBlockSubnet: string;
  vpcId: string;
  subnetId: string;
  region: string;
  awsAccountId: string;
  imageId: string; // AMI ID for the instance
  instanceType: string; // EC2 instance type
  keyName: string;
  minInstanceCount: number; // Minimum instances to launch
  maxInstanceCount: number; // Maximum instances to launch
  IamInstanceProfile: {
    Name: string;
  };
}