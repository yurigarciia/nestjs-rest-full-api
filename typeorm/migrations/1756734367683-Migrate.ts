import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class Migrate1756734367683 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '63',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'int',
            default: '1',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '127',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}

// CREATE TABLE `users` (
//   `id` int NOT NULL AUTO_INCREMENT,
//   `name` varchar(63) COLLATE utf8mb4_unicode_ci NOT NULL,
//   `role` int NOT NULL DEFAULT '1',
//   `email` varchar(127) COLLATE utf8mb4_unicode_ci NOT NULL,
//   `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
//   `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
//   `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
//   PRIMARY KEY (`id`),
//   UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`)
// ) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
