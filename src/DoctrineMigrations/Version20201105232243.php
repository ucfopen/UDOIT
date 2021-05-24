<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20201105232243 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('DROP TABLE issue_report');
        $this->addSql('ALTER TABLE report ADD content_fixed INT DEFAULT NULL, ADD content_resolved INT DEFAULT NULL, ADD files_reviewed INT DEFAULT NULL');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE issue_report (issue_id INT NOT NULL, report_id INT NOT NULL, INDEX IDX_36DFFDA35E7AA58C (issue_id), INDEX IDX_36DFFDA34BD2A4C0 (report_id), PRIMARY KEY(issue_id, report_id)) DEFAULT CHARACTER SET utf8 COLLATE `utf8_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE issue_report ADD CONSTRAINT FK_36DFFDA34BD2A4C0 FOREIGN KEY (report_id) REFERENCES report (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE issue_report ADD CONSTRAINT FK_36DFFDA35E7AA58C FOREIGN KEY (issue_id) REFERENCES issue (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE report DROP content_fixed, DROP content_resolved, DROP files_reviewed');
    }
}
