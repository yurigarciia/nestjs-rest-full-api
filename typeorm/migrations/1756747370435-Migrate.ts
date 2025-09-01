import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class Migrate1756747370435 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'users_tokens',
      'token',
      new TableColumn({
        name: 'token',
        type: 'varchar',
        length: '512',
        isUnique: true,
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.changeColumn(
      'users_tokens',
      'token',
      new TableColumn({
        name: 'token',
        type: 'varchar',
        length: '255',
        isUnique: true,
        isNullable: false,
      }),
    );
  }
}
