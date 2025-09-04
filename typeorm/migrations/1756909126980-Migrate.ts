import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class Migrate1756909126980 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('users_tokens');
    const refreshTokenColumn = table?.findColumnByName('refreshToken');
    if (refreshTokenColumn && refreshTokenColumn.isUnique) {
      await queryRunner.changeColumn(
        'users_tokens',
        'refreshToken',
        new TableColumn({
          name: 'refreshToken',
          type: 'varchar',
          length: '512',
          isNullable: true,
        }),
      );
    }

    if (!refreshTokenColumn) {
      await queryRunner.addColumn(
        'users_tokens',
        new TableColumn({
          name: 'refreshToken',
          type: 'varchar',
          length: '512',
          isNullable: true,
        }),
      );
    }

    if (!table?.findColumnByName('refreshExpiresAt')) {
      await queryRunner.addColumn(
        'users_tokens',
        new TableColumn({
          name: 'refreshExpiresAt',
          type: 'timestamp',
          isNullable: true,
        }),
      );
    }

    const hasIndex = table?.indices.some(
      (idx) =>
        idx.columnNames.length === 1 && idx.columnNames[0] === 'refreshToken',
    );
    if (!hasIndex) {
      await queryRunner.createIndex(
        'users_tokens',
        new TableIndex({
          name: 'IDX_users_tokens_refresh_token',
          columnNames: ['refreshToken'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove índice de refreshToken
    await queryRunner.dropIndex(
      'users_tokens',
      'IDX_users_tokens_refresh_token',
    );

    // Remove coluna refreshExpiresAt
    const table = await queryRunner.getTable('users_tokens');
    if (table?.findColumnByName('refreshExpiresAt')) {
      await queryRunner.dropColumn('users_tokens', 'refreshExpiresAt');
    }

    // Remove coluna refreshToken
    if (table?.findColumnByName('refreshToken')) {
      await queryRunner.dropColumn('users_tokens', 'refreshToken');
    }
  }
}
