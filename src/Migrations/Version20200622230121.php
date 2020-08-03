<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200622230121 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('DROP TABLE log_item');
        $this->addSql('DROP TABLE report_content_item');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE log_item (id INT AUTO_INCREMENT NOT NULL, user_id_id INT DEFAULT NULL, course_id_id INT DEFAULT NULL, message LONGTEXT CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, severity VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, created DATETIME NOT NULL, INDEX IDX_E75CB6B96EF99BF (course_id_id), INDEX IDX_E75CB6B9D86650F (user_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE `utf8_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('CREATE TABLE report_content_item (report_id INT NOT NULL, content_item_id INT NOT NULL, INDEX IDX_DC1358424BD2A4C0 (report_id), INDEX IDX_DC135842CD678BED (content_item_id), PRIMARY KEY(report_id, content_item_id)) DEFAULT CHARACTER SET utf8 COLLATE `utf8_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE report_content_item ADD CONSTRAINT FK_DC1358424BD2A4C0 FOREIGN KEY (report_id) REFERENCES report (id) ON UPDATE NO ACTION ON DELETE CASCADE');
        $this->addSql('ALTER TABLE report_content_item ADD CONSTRAINT FK_DC135842CD678BED FOREIGN KEY (content_item_id) REFERENCES content_item (id) ON UPDATE NO ACTION ON DELETE CASCADE');
    }
}
