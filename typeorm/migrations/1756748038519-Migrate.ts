import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class Migrate1756748038519 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users_tokens', 'id');

    await queryRunner.addColumn(
      'users_tokens',
      new TableColumn({
        name: 'id',
        type: 'int',
        isPrimary: true,
        isGenerated: true,
        generationStrategy: 'increment',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users_tokens', 'id');

    await queryRunner.addColumn(
      'users_tokens',
      new TableColumn({
        name: 'id',
        type: 'char',
        length: '36',
        isPrimary: true,
        isNullable: false,
      }),
    );
  }
}
