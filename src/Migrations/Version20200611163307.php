<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200611163307 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE content_item ADD active TINYINT(1) NOT NULL, ADD title VARCHAR(255) NOT NULL');
        $this->addSql('ALTER TABLE user ADD institution_id INT NOT NULL, ADD roles JSON DEFAULT NULL, DROP lms_domain, CHANGE lms_user_id lms_user_id VARCHAR(128) NOT NULL, CHANGE api_key api_key VARCHAR(255) DEFAULT NULL, CHANGE refresh_token refresh_token VARCHAR(255) DEFAULT NULL, CHANGE username username VARCHAR(180) NOT NULL');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D64910405986 FOREIGN KEY (institution_id) REFERENCES institution (id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649F85E0677 ON user (username)');
        $this->addSql('CREATE INDEX IDX_8D93D64910405986 ON user (institution_id)');
        $this->addSql('ALTER TABLE institution CHANGE lms_id lms_id VARCHAR(64) DEFAULT NULL');
        $this->addSql('ALTER TABLE course ADD active TINYINT(1) DEFAULT NULL, ADD dirty TINYINT(1) DEFAULT NULL');
        $this->addSql('ALTER TABLE report ADD course_id INT NOT NULL');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F7784591CC992 FOREIGN KEY (course_id) REFERENCES course (id)');
        $this->addSql('CREATE INDEX IDX_C42F7784591CC992 ON report (course_id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE content_item DROP active, DROP title');
        $this->addSql('ALTER TABLE course DROP active, DROP dirty');
        $this->addSql('ALTER TABLE institution CHANGE lms_id lms_id INT NOT NULL');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F7784591CC992');
        $this->addSql('DROP INDEX IDX_C42F7784591CC992 ON report');
        $this->addSql('ALTER TABLE report DROP course_id');
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D64910405986');
        $this->addSql('DROP INDEX UNIQ_8D93D649F85E0677 ON user');
        $this->addSql('DROP INDEX IDX_8D93D64910405986 ON user');
        $this->addSql('ALTER TABLE user ADD lms_domain VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, DROP institution_id, DROP roles, CHANGE username username VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, CHANGE lms_user_id lms_user_id VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, CHANGE api_key api_key VARCHAR(512) CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, CHANGE refresh_token refresh_token VARCHAR(512) CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`');
    }
}
