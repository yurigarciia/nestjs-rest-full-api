import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class Migrate1756746209634 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users_tokens',
        columns: [
          {
            name: 'id',
            type: 'char',
            length: '36',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'token',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'userId',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'active',
            type: 'tinyint',
            width: 1,
            isNullable: false,
            default: 1,
          },
          {
            name: 'expiresAt',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            precision: 6,
            default: 'CURRENT_TIMESTAMP(6)',
            onUpdate: 'CURRENT_TIMESTAMP(6)',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'users_tokens',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
        name: 'FK_users_tokens_user',
      }),
    );

    await queryRunner.createIndex(
      'users_tokens',
      new TableIndex({
        name: 'IDX_users_tokens_token',
        columnNames: ['token'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('users_tokens', 'IDX_users_tokens_token');
    await queryRunner.dropForeignKey('users_tokens', 'FK_users_tokens_user');
    await queryRunner.dropTable('users_tokens');
  }
}
