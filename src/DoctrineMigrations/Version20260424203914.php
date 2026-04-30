<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260424203914 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        
        $this->skipIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE users ADD preferences JSON DEFAULT NULL');
        $this->addSql(<<<SQL
        UPDATE users
            SET
                preferences = CASE
                    WHEN JSON_EXTRACT(roles, '$.darkMode') IS NOT NULL
                        OR JSON_EXTRACT(roles, '$.textSpacing') IS NOT NULL
                        OR JSON_EXTRACT(roles, '$.fontSize') IS NOT NULL
                        OR JSON_EXTRACT(roles, '$.fontFamily') IS NOT NULL
                        OR JSON_EXTRACT(roles, '$.alertTimeout') IS NOT NULL
                        OR JSON_EXTRACT(roles, '$.lang') IS NOT NULL
                    THEN JSON_REMOVE(
                        JSON_OBJECT(
                            'darkMode', JSON_EXTRACT(roles, '$.darkMode'),
                            'textSpacing', JSON_EXTRACT(roles, '$.textSpacing'),
                            'fontSize', JSON_EXTRACT(roles, '$.fontSize'),
                            'fontFamily', JSON_EXTRACT(roles, '$.fontFamily'),
                            'alertTimeout', JSON_EXTRACT(roles, '$.alertTimeout'),
                            'lang', JSON_EXTRACT(roles, '$.lang')
                        ),
                        CASE WHEN JSON_EXTRACT(roles, '$.darkMode') IS NULL THEN '$.darkMode' ELSE '$.__nonexistent' END,
                        CASE WHEN JSON_EXTRACT(roles, '$.textSpacing') IS NULL THEN '$.textSpacing' ELSE '$.__nonexistent' END,
                        CASE WHEN JSON_EXTRACT(roles, '$.fontSize') IS NULL THEN '$.fontSize' ELSE '$.__nonexistent' END,
                        CASE WHEN JSON_EXTRACT(roles, '$.fontFamily') IS NULL THEN '$.fontFamily' ELSE '$.__nonexistent' END,
                        CASE WHEN JSON_EXTRACT(roles, '$.alertTimeout') IS NULL THEN '$.alertTimeout' ELSE '$.__nonexistent' END,
                        CASE WHEN JSON_EXTRACT(roles, '$.lang') IS NULL THEN '$.lang' ELSE '$.__nonexistent' END
                    )
                    ELSE JSON_OBJECT()
                END
        SQL);
        $this->addSql('UPDATE users SET roles = \'["ROLE_USER"]\'');
    }

    public function down(Schema $schema): void
    {
        $this->skipIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql(<<<SQL
            UPDATE users
            SET roles = JSON_MERGE_PATCH(
                JSON_OBJECT('0', 'ROLE_USER'),
                preferences
            )
            WHERE preferences IS NOT NULL
        SQL);

        $this->addSql('ALTER TABLE users DROP preferences');
    }
}
