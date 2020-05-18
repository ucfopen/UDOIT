<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200318213842 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE issue (id INT AUTO_INCREMENT NOT NULL, content_item_id INT NOT NULL, scan_rule_id VARCHAR(255) NOT NULL, html LONGTEXT DEFAULT NULL, type VARCHAR(255) NOT NULL, status TINYINT(1) NOT NULL, INDEX IDX_12AD233ECD678BED (content_item_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE issue_report (issue_id INT NOT NULL, report_id INT NOT NULL, INDEX IDX_36DFFDA35E7AA58C (issue_id), INDEX IDX_36DFFDA34BD2A4C0 (report_id), PRIMARY KEY(issue_id, report_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE issue ADD CONSTRAINT FK_12AD233ECD678BED FOREIGN KEY (content_item_id) REFERENCES content_item (id)');
        $this->addSql('ALTER TABLE issue_report ADD CONSTRAINT FK_36DFFDA35E7AA58C FOREIGN KEY (issue_id) REFERENCES issue (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE issue_report ADD CONSTRAINT FK_36DFFDA34BD2A4C0 FOREIGN KEY (report_id) REFERENCES report (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE course CHANGE title title VARCHAR(255) NOT NULL');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE issue_report DROP FOREIGN KEY FK_36DFFDA35E7AA58C');
        $this->addSql('DROP TABLE issue');
        $this->addSql('DROP TABLE issue_report');
        $this->addSql('ALTER TABLE course CHANGE title title VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT \'\' NOT NULL COLLATE `utf8mb4_unicode_ci`');
    }
}
