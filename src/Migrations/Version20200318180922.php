<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200318180922 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE queue_item (id INT AUTO_INCREMENT NOT NULL, user_id INT DEFAULT NULL, report_id INT NOT NULL, status VARCHAR(64) NOT NULL, created DATETIME NOT NULL, completed DATETIME NOT NULL, metadata LONGTEXT DEFAULT NULL, INDEX IDX_BA4B6DE8A76ED395 (user_id), INDEX IDX_BA4B6DE84BD2A4C0 (report_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE queue_item ADD CONSTRAINT FK_BA4B6DE8A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE queue_item ADD CONSTRAINT FK_BA4B6DE84BD2A4C0 FOREIGN KEY (report_id) REFERENCES report (id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE queue_item');
    }
}
