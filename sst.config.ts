/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "zchat",
      removal: input?.stage === "production" ? "retain" : "remove",
      //protect: ["production"].includes(input?.stage),
      home: "aws",
      stage: "default",
    };
  },
  async run() {
    const vpc = new sst.aws.Vpc("MyVpc");
    const cluster = new sst.aws.Cluster("MyCluster", { vpc });
  
    new sst.aws.Service("MyService", {
      cluster,
      loadBalancer: {
        ports: [{ listen: "80/http" }],
      },
      dev: {
        command: "node --watch index.mjs",
      },
    });
  },
});
