import { appDataSource } from '../dataSource';
import { glob } from 'glob';
import { join, dirname } from 'path';

(async () => {
    await appDataSource.initialize();

    const queryRunner = appDataSource.createQueryRunner();
    const migrations = await glob(
        join(dirname(__dirname), 'migrations', '*.ts'),
    );
    for (const migrationPath of migrations.reverse()) {
        const data = await import(migrationPath);
        const Class: any = Object.values(data)[0];
        const instance = new Class();
        try {
            await instance.down(queryRunner);
        } catch {}
    }
    await appDataSource.destroy();
})();
