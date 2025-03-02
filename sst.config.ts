/// <reference path="./.sst/platform/config.d.ts" />
import { execSync } from 'child_process';

export default $config({
	app(input) {
		return {
			name: 'zchat',
			removal: input?.stage === 'production' ? 'retain' : 'remove',
			//protect: ["production"].includes(input?.stage),
			home: 'aws',
			stage: 'default'
		};
	},
	async run() {
		const vpc = new sst.aws.Vpc('MyVpc', {
			az: 2,
			nat: 'ec2'
		});
		const cluster = new sst.aws.Cluster('MyCluster', { vpc });

		const zeroVersion = execSync(
			'npm list @rocicorp/zero | grep @rocicorp/zero | cut -f 3 -d @ | head -1'
		)
			.toString()
			.trim();

		// S3 Bucket
		const replicationBucket = new sst.aws.Bucket(`replication-bucket`);

		const conn = new sst.Secret('PostgresConnectionString');
		const zeroAuthSecret = new sst.Secret('ZeroAuthSecret');

		// Common environment variables
		const commonEnv = {
			ZERO_UPSTREAM_DB: conn.value,
			ZERO_CVR_DB: conn.value,
			ZERO_CHANGE_DB: conn.value,
			ZERO_AUTH_SECRET: zeroAuthSecret.value,
			ZERO_REPLICA_FILE: 'sync-replica.db',
			ZERO_LITESTREAM_BACKUP_URL: $interpolate`s3://${replicationBucket.name}/backup`,
			ZERO_IMAGE_URL: `rocicorp/zero:${zeroVersion}`,
			ZERO_CVR_MAX_CONNS: '10',
			ZERO_UPSTREAM_MAX_CONNS: '10'
		};

		const replicationManager = new sst.aws.Service('replication-manager', {
			cluster,
			cpu: '2 vCPU',
			memory: '8 GB',
			image: commonEnv.ZERO_IMAGE_URL,
			link: [replicationBucket],
			health: {
				command: ['CMD-SHELL', 'curl -f http://localhost:4849/ || exit 1'],
				interval: '5 seconds',
				retries: 3,
				startPeriod: '300 seconds'
			},
			environment: {
				...commonEnv,
				ZERO_CHANGE_MAX_CONNS: '3',
				ZERO_NUM_SYNC_WORKERS: '0'
			},
			loadBalancer: {
				public: false,
				ports: [
					{
						listen: '80/http',
						forward: '4849/http'
					}
				]
			},
			transform: {
				loadBalancer: {
					idleTimeout: 3600
				},
				target: {
					healthCheck: {
						enabled: true,
						path: '/keepalive',
						protocol: 'HTTP',
						interval: 5,
						healthyThreshold: 2,
						timeout: 3
					}
				}
			}
		});

		const viewSyncer = new sst.aws.Service('view-syncer', {
			cluster,
			cpu: '2 vCPU',
			memory: '8 GB',
			image: commonEnv.ZERO_IMAGE_URL,
			link: [replicationBucket],
			health: {
				command: ['CMD-SHELL', 'curl -f http://localhost:4848/ || exit 1'],
				interval: '5 seconds',
				retries: 3,
				startPeriod: '300 seconds'
			},
			environment: {
				...commonEnv,
				ZERO_CHANGE_STREAMER_URI: replicationManager.url
			},
			logging: {
				retention: '1 month'
			},
			loadBalancer: {
				public: true,
				rules: [{ listen: '80/http', forward: '4848/http' }]
			},
			transform: {
				target: {
					healthCheck: {
						enabled: true,
						path: '/keepalive',
						protocol: 'HTTP',
						interval: 5,
						healthyThreshold: 2,
						timeout: 3
					},
					stickiness: {
						enabled: true,
						type: 'lb_cookie',
						cookieDuration: 120
					},
					loadBalancingAlgorithmType: 'least_outstanding_requests'
				}
			}
		});

		// // Permissions deployment
		// const permissionsDeployer = new sst.aws.Function('zero-permissions-deployer', {
		// 	handler: './functions/src/permissions.deploy',
		// 	vpc,
		// 	environment: { ['ZERO_UPSTREAM_DB']: conn.value },
		// 	copyFiles: [{ from: './src/schema.ts', to: './schema.ts' }],
		// 	nodejs: { install: [`@rocicorp/zero`] }
		// });

		// new aws.lambda.Invocation(
		// 	'invoke-zero-permissions-deployer',
		// 	{
		// 		// Invoke the Lambda on every deploy.
		// 		input: Date.now().toString(),
		// 		functionName: permissionsDeployer.name
		// 	},
		// 	{ dependsOn: viewSyncer }
		// );

		new sst.aws.Service('svelte-kit', {
			cluster,
			loadBalancer: {
				ports: [{ listen: '80/http', forward: '3000/http' }]
			},
			dev: {
				command: 'npm run dev'
			}
		});
	}
});
