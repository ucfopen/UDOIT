<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20201203190518 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE file_item ADD reviewed_by_id INT DEFAULT NULL, ADD url VARCHAR(255) DEFAULT NULL, ADD reviewed_on DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE file_item ADD CONSTRAINT FK_96E74D70FC6B21F1 FOREIGN KEY (reviewed_by_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_96E74D70FC6B21F1 ON file_item (reviewed_by_id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE file_item DROP FOREIGN KEY FK_96E74D70FC6B21F1');
        $this->addSql('DROP INDEX IDX_96E74D70FC6B21F1 ON file_item');
        $this->addSql('ALTER TABLE file_item DROP reviewed_by_id, DROP url, DROP reviewed_on');
    }
}
