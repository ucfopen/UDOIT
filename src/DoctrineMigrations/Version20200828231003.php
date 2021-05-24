<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200828231003 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE issue ADD fixed_by_id INT DEFAULT NULL, ADD fixed_on DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE issue ADD CONSTRAINT FK_12AD233EC38008F2 FOREIGN KEY (fixed_by_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_12AD233EC38008F2 ON issue (fixed_by_id)');
        $this->addSql('ALTER TABLE report ADD author_id INT NOT NULL');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F7784F675F31B FOREIGN KEY (author_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_C42F7784F675F31B ON report (author_id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE issue DROP FOREIGN KEY FK_12AD233EC38008F2');
        $this->addSql('DROP INDEX IDX_12AD233EC38008F2 ON issue');
        $this->addSql('ALTER TABLE issue DROP fixed_by_id, DROP fixed_on');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F7784F675F31B');
        $this->addSql('DROP INDEX IDX_C42F7784F675F31B ON report');
        $this->addSql('ALTER TABLE report DROP author_id');
    }
}
