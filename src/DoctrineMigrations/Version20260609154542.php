<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260609154542 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE lti_session (id INT AUTO_INCREMENT NOT NULL, state VARCHAR(255) NOT NULL, nonce VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, expires_at DATETIME NOT NULL, registration_id INT DEFAULT NULL, INDEX IDX_FF054CCE833D8F43 (registration_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE lti_session ADD CONSTRAINT FK_FF054CCE833D8F43 FOREIGN KEY (registration_id) REFERENCES registration (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE lti_session DROP FOREIGN KEY FK_FF054CCE833D8F43');
        $this->addSql('DROP TABLE lti_session');
    }
}
