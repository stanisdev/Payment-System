import * as os from 'node:os';
import * as process from 'node:process';
import * as notReallyCluster from 'cluster';
import Bootstrap from './bootstrap';
import { LoggerProvider } from './common/providers/logger/logger.provider';

/**
 * The workaround below is an attempt to fix a system bug
 * when importing the 'cluster' module. The bug has been discussed
 * more than once.
 *
 * https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/54470
 * https://github.com/nodejs/node/issues/42271
 */
const cluster = notReallyCluster as unknown as notReallyCluster.Cluster;

const numCPUs = os.availableParallelism();
const logger = new LoggerProvider();

export class AppExecutor {
    start() {
        if (process.env.NODE_ENV === 'production') {
            this.clustering();
        } else {
            new Bootstrap().run();
        }
    }

    private clustering() {
        if (cluster.isPrimary === true) {
            logger.log(`Primary ${process.pid} is running`);

            for (let i = 0; i < numCPUs; i++) {
                cluster.fork();
            }
            /**
             * If a worker is dead spawn a new one
             */
            cluster.on('exit', (worker, code, signal) => {
                logger.log(`Worker ${worker.process.pid} died`);
                cluster.fork();
            });
        } else {
            new Bootstrap().run();
            logger.log(`Worker ${process.pid} started`);
        }
    }
}
