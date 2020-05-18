<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200317231029 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE log_item DROP FOREIGN KEY FK_E75CB6B96EF99BF');
        $this->addSql('ALTER TABLE log_item DROP FOREIGN KEY FK_E75CB6B9D86650F');
        $this->addSql('DROP INDEX IDX_E75CB6B96EF99BF ON log_item');
        $this->addSql('DROP INDEX IDX_E75CB6B9D86650F ON log_item');
        $this->addSql('ALTER TABLE log_item DROP user_id_id, DROP course_id_id');
        $this->addSql('ALTER TABLE user DROP institution_id');
        $this->addSql('ALTER TABLE queue_item DROP FOREIGN KEY FK_BA4B6DE85558992E');
        $this->addSql('ALTER TABLE queue_item DROP FOREIGN KEY FK_BA4B6DE89D86650F');
        $this->addSql('DROP INDEX IDX_BA4B6DE85558992E ON queue_item');
        $this->addSql('DROP INDEX IDX_BA4B6DE89D86650F ON queue_item');
        $this->addSql('ALTER TABLE queue_item DROP user_id_id, DROP report_id_id');
        $this->addSql('ALTER TABLE course DROP institution_id');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F778496EF99BF');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F77849D86650F');
        $this->addSql('DROP INDEX IDX_C42F77849D86650F ON report');
        $this->addSql('DROP INDEX IDX_C42F778496EF99BF ON report');
        $this->addSql('ALTER TABLE report DROP course_id_id, DROP user_id_id');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE course ADD institution_id INT NOT NULL');
        $this->addSql('ALTER TABLE log_item ADD user_id_id INT DEFAULT NULL, ADD course_id_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE log_item ADD CONSTRAINT FK_E75CB6B96EF99BF FOREIGN KEY (course_id_id) REFERENCES course (id)');
        $this->addSql('ALTER TABLE log_item ADD CONSTRAINT FK_E75CB6B9D86650F FOREIGN KEY (user_id_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_E75CB6B96EF99BF ON log_item (course_id_id)');
        $this->addSql('CREATE INDEX IDX_E75CB6B9D86650F ON log_item (user_id_id)');
        $this->addSql('ALTER TABLE queue_item ADD user_id_id INT DEFAULT NULL, ADD report_id_id INT NOT NULL');
        $this->addSql('ALTER TABLE queue_item ADD CONSTRAINT FK_BA4B6DE85558992E FOREIGN KEY (report_id_id) REFERENCES report (id)');
        $this->addSql('ALTER TABLE queue_item ADD CONSTRAINT FK_BA4B6DE89D86650F FOREIGN KEY (user_id_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_BA4B6DE85558992E ON queue_item (report_id_id)');
        $this->addSql('CREATE INDEX IDX_BA4B6DE89D86650F ON queue_item (user_id_id)');
        $this->addSql('ALTER TABLE report ADD course_id_id INT NOT NULL, ADD user_id_id INT NOT NULL');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F778496EF99BF FOREIGN KEY (course_id_id) REFERENCES course (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F77849D86650F FOREIGN KEY (user_id_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_C42F77849D86650F ON report (user_id_id)');
        $this->addSql('CREATE INDEX IDX_C42F778496EF99BF ON report (course_id_id)');
        $this->addSql('ALTER TABLE user ADD institution_id INT NOT NULL');
    }
}
