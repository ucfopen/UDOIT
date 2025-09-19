<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250903152420 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {

        $this->skipIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration is for \'postgresql\' only.');
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE course_user (id INT AUTO_INCREMENT NOT NULL, course_id INT NOT NULL, user_id INT DEFAULT NULL, lms_user_id VARCHAR(64) NOT NULL, display_name VARCHAR(255) DEFAULT NULL, fetched_at DATETIME DEFAULT NULL, INDEX IDX_45310B4F591CC992 (course_id), INDEX IDX_45310B4FA76ED395 (user_id), UNIQUE INDEX uniq_course_lmsuser (course_id, lms_user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE course_user ADD CONSTRAINT FK_45310B4F591CC992 FOREIGN KEY (course_id) REFERENCES course (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE course_user ADD CONSTRAINT FK_45310B4FA76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE users RENAME INDEX uniq_8d93d649f85e0677 TO UNIQ_1483A5E9F85E0677');
        $this->addSql('ALTER TABLE users RENAME INDEX idx_8d93d64910405986 TO IDX_1483A5E910405986');
        $this->addSql('ALTER TABLE messenger_messages CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE available_at available_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE delivered_at delivered_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
    }

    public function down(Schema $schema): void
    {

        $this->skipIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration is for \'postgresql\' only.');
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE course_user DROP FOREIGN KEY FK_45310B4F591CC992');
        $this->addSql('ALTER TABLE course_user DROP FOREIGN KEY FK_45310B4FA76ED395');
        $this->addSql('DROP TABLE course_user');
        $this->addSql('ALTER TABLE messenger_messages CHANGE created_at created_at DATETIME NOT NULL, CHANGE available_at available_at DATETIME NOT NULL, CHANGE delivered_at delivered_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE users RENAME INDEX idx_1483a5e910405986 TO IDX_8D93D64910405986');
        $this->addSql('ALTER TABLE users RENAME INDEX uniq_1483a5e9f85e0677 TO UNIQ_8D93D649F85E0677');
    }
}
