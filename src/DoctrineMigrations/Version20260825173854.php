<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260825173854 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY `FK_C42F7784F675F31B`');
        $this->addSql('DROP INDEX IDX_C42F7784F675F31B ON report');
        $this->addSql('ALTER TABLE report ADD issues INT DEFAULT NULL, ADD potential_issues INT DEFAULT NULL, ADD unreviewed_files INT DEFAULT NULL, ADD issues_fixed INT DEFAULT NULL, ADD issues_reviewed INT DEFAULT NULL, ADD potential_issues_fixed INT DEFAULT NULL, ADD potential_issues_reviewed INT DEFAULT NULL, ADD reviewed_files INT DEFAULT NULL, ADD highest_scan_rule VARCHAR(255) NOT NULL, DROP data, DROP errors, DROP suggestions, DROP ready, DROP content_fixed, DROP content_resolved, DROP files_reviewed, CHANGE author_id user_id INT NOT NULL');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F7784A76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
        $this->addSql('CREATE INDEX IDX_C42F7784A76ED395 ON report (user_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F7784A76ED395');
        $this->addSql('DROP INDEX IDX_C42F7784A76ED395 ON report');
        $this->addSql('ALTER TABLE report ADD data LONGTEXT DEFAULT NULL, ADD errors INT DEFAULT NULL, ADD suggestions INT DEFAULT NULL, ADD ready TINYINT NOT NULL, ADD content_fixed INT DEFAULT NULL, ADD content_resolved INT DEFAULT NULL, ADD files_reviewed INT DEFAULT NULL, DROP issues, DROP potential_issues, DROP unreviewed_files, DROP issues_fixed, DROP issues_reviewed, DROP potential_issues_fixed, DROP potential_issues_reviewed, DROP reviewed_files, DROP highest_scan_rule, CHANGE user_id author_id INT NOT NULL');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT `FK_C42F7784F675F31B` FOREIGN KEY (author_id) REFERENCES users (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_C42F7784F675F31B ON report (author_id)');
    }
}
