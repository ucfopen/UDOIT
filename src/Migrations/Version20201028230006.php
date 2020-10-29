<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20201028230006 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE file_item (id INT AUTO_INCREMENT NOT NULL, course_id INT DEFAULT NULL, file_name VARCHAR(255) NOT NULL, file_type VARCHAR(32) NOT NULL, lms_file_id VARCHAR(255) NOT NULL, updated DATETIME DEFAULT NULL, metadata LONGTEXT DEFAULT NULL, status TINYINT(1) DEFAULT NULL, file_size VARCHAR(255) DEFAULT NULL, INDEX IDX_96E74D70591CC992 (course_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE file_item ADD CONSTRAINT FK_96E74D70591CC992 FOREIGN KEY (course_id) REFERENCES course (id)');
        $this->addSql('ALTER TABLE content_item DROP file_type');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE file_item');
        $this->addSql('ALTER TABLE content_item ADD file_type VARCHAR(15) CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`');
    }
}
