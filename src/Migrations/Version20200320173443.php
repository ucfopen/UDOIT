<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200320173443 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, username VARCHAR(180) NOT NULL, roles JSON NOT NULL, UNIQUE INDEX UNIQ_8D93D649F85E0677 (username), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE log_entry DROP FOREIGN KEY FK_B5F762DA76ED395');
        $this->addSql('ALTER TABLE log_entry ADD CONSTRAINT FK_B5F762DA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE queue_item DROP FOREIGN KEY FK_BA4B6DE8A76ED395');
        $this->addSql('ALTER TABLE queue_item ADD CONSTRAINT FK_BA4B6DE8A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE log_entry DROP FOREIGN KEY FK_B5F762DA76ED395');
        $this->addSql('ALTER TABLE queue_item DROP FOREIGN KEY FK_BA4B6DE8A76ED395');
        $this->addSql('DROP TABLE user');
        $this->addSql('ALTER TABLE log_entry DROP FOREIGN KEY FK_B5F762DA76ED395');
        $this->addSql('ALTER TABLE log_entry ADD CONSTRAINT FK_B5F762DA76ED395 FOREIGN KEY (user_id) REFERENCES user_old (id)');
        $this->addSql('ALTER TABLE queue_item DROP FOREIGN KEY FK_BA4B6DE8A76ED395');
        $this->addSql('ALTER TABLE queue_item ADD CONSTRAINT FK_BA4B6DE8A76ED395 FOREIGN KEY (user_id) REFERENCES user_old (id)');
    }
}
