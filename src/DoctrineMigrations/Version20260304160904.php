<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260304160904 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
{
        $this->skipIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE account (lms_account_id VARCHAR(255) NOT NULL, institution_id INT NOT NULL, account_name VARCHAR(255) NOT NULL, INDEX IDX_7D3656A410405986 (institution_id), PRIMARY KEY(lms_account_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE term (lms_term_id VARCHAR(255) NOT NULL, institution_id INT NOT NULL, term_name VARCHAR(255) NOT NULL, INDEX IDX_A50FE78D10405986 (institution_id), PRIMARY KEY(lms_term_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE account ADD CONSTRAINT FK_7D3656A410405986 FOREIGN KEY (institution_id) REFERENCES institution (id)');
        $this->addSql('ALTER TABLE term ADD CONSTRAINT FK_A50FE78D10405986 FOREIGN KEY (institution_id) REFERENCES institution (id)');
    }

    public function down(Schema $schema): void
    {
        $this->skipIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE account DROP FOREIGN KEY FK_7D3656A410405986');
        $this->addSql('ALTER TABLE term DROP FOREIGN KEY FK_A50FE78D10405986');
        $this->addSql('DROP TABLE account');
        $this->addSql('DROP TABLE term');
    }
}
