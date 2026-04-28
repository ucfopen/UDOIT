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
                    WHEN JSON_EXTRACT(roles, '$.dark_mode') IS NOT NULL
                        OR JSON_EXTRACT(roles, '$.text_spacing') IS NOT NULL
                        OR JSON_EXTRACT(roles, '$.font_size') IS NOT NULL
                        OR JSON_EXTRACT(roles, '$.font_family') IS NOT NULL
                        OR JSON_EXTRACT(roles, '$.alert_timeout') IS NOT NULL
                        OR JSON_EXTRACT(roles, '$.daily_goal') IS NOT NULL
                        OR JSON_EXTRACT(roles, '$.show_filters') IS NOT NULL
                        OR JSON_EXTRACT(roles, '$.view_only_published') IS NOT NULL
                        OR JSON_EXTRACT(roles, '$.lang') IS NOT NULL
                    THEN JSON_REMOVE(
                        JSON_OBJECT(
                            'dark_mode', JSON_EXTRACT(roles, '$.dark_mode'),
                            'text_spacing', JSON_EXTRACT(roles, '$.text_spacing'),
                            'font_size', JSON_EXTRACT(roles, '$.font_size'),
                            'font_family', JSON_EXTRACT(roles, '$.font_family'),
                            'alert_timeout', JSON_EXTRACT(roles, '$.alert_timeout'),
                            'daily_goal', JSON_EXTRACT(roles, '$.daily_goal'),
                            'show_filters', JSON_EXTRACT(roles, '$.show_filters'),
                            'view_only_published', JSON_EXTRACT(roles, '$.view_only_published'),
                            'lang', JSON_EXTRACT(roles, '$.lang')
                        ),
                        CASE WHEN JSON_EXTRACT(roles, '$.dark_mode') IS NULL THEN '$.dark_mode' ELSE '$.__nonexistent' END,
                        CASE WHEN JSON_EXTRACT(roles, '$.text_spacing') IS NULL THEN '$.text_spacing' ELSE '$.__nonexistent' END,
                        CASE WHEN JSON_EXTRACT(roles, '$.font_size') IS NULL THEN '$.font_size' ELSE '$.__nonexistent' END,
                        CASE WHEN JSON_EXTRACT(roles, '$.font_family') IS NULL THEN '$.font_family' ELSE '$.__nonexistent' END,
                        CASE WHEN JSON_EXTRACT(roles, '$.alert_timeout') IS NULL THEN '$.alert_timeout' ELSE '$.__nonexistent' END,
                        CASE WHEN JSON_EXTRACT(roles, '$.daily_goal') IS NULL THEN '$.daily_goal' ELSE '$.__nonexistent' END,
                        CASE WHEN JSON_EXTRACT(roles, '$.show_filters') IS NULL THEN '$.show_filters' ELSE '$.__nonexistent' END,
                        CASE WHEN JSON_EXTRACT(roles, '$.view_only_published') IS NULL THEN '$.view_only_published' ELSE '$.__nonexistent' END,
                        CASE WHEN JSON_EXTRACT(roles, '$.lang') IS NULL THEN '$.lang' ELSE '$.__nonexistent' END
                    )
                    ELSE NULL
                END
            WHERE roles IS NOT NULL
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
