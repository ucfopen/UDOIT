<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20200317230319 extends AbstractMigration
{
    public function getDescription() : string
    {
        return '';
    }

    public function up(Schema $schema) : void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE log_item (id INT AUTO_INCREMENT NOT NULL, user_id_id INT DEFAULT NULL, course_id_id INT DEFAULT NULL, message LONGTEXT NOT NULL, severity VARCHAR(255) NOT NULL, created DATETIME NOT NULL, INDEX IDX_E75CB6B9D86650F (user_id_id), INDEX IDX_E75CB6B96EF99BF (course_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, institution_id INT NOT NULL, lms_user_id VARCHAR(255) NOT NULL, api_key VARCHAR(512) DEFAULT NULL, refresh_token VARCHAR(512) DEFAULT NULL, created DATETIME NOT NULL, last_login DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE queue_item (id INT AUTO_INCREMENT NOT NULL, user_id_id INT DEFAULT NULL, report_id_id INT NOT NULL, status INT NOT NULL, data LONGTEXT DEFAULT NULL, created DATETIME NOT NULL, completed DATETIME DEFAULT NULL, INDEX IDX_BA4B6DE89D86650F (user_id_id), INDEX IDX_BA4B6DE85558992E (report_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE institution (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) NOT NULL, lms_domain VARCHAR(255) DEFAULT NULL, lms_id INT NOT NULL, lms_account_id VARCHAR(255) DEFAULT NULL, consumer_key VARCHAR(255) DEFAULT NULL, shared_secret VARCHAR(255) DEFAULT NULL, developer_id VARCHAR(255) DEFAULT NULL, developer_key VARCHAR(255) DEFAULT NULL, created DATETIME NOT NULL, status TINYINT(1) NOT NULL, vanity_url VARCHAR(255) DEFAULT NULL, metadata LONGTEXT DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE course (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) DEFAULT NULL, lms_account_id VARCHAR(255) DEFAULT NULL, lms_course_id VARCHAR(255) DEFAULT NULL, last_updated DATETIME DEFAULT NULL, content_items LONGTEXT DEFAULT NULL, institution_id INT NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE report (id INT AUTO_INCREMENT NOT NULL, course_id_id INT NOT NULL, user_id_id INT NOT NULL, data LONGTEXT DEFAULT NULL, created DATETIME NOT NULL, errors INT DEFAULT NULL, suggestions INT DEFAULT NULL, INDEX IDX_C42F778496EF99BF (course_id_id), INDEX IDX_C42F77849D86650F (user_id_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE log_item ADD CONSTRAINT FK_E75CB6B9D86650F FOREIGN KEY (user_id_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE log_item ADD CONSTRAINT FK_E75CB6B96EF99BF FOREIGN KEY (course_id_id) REFERENCES course (id)');
        $this->addSql('ALTER TABLE queue_item ADD CONSTRAINT FK_BA4B6DE89D86650F FOREIGN KEY (user_id_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE queue_item ADD CONSTRAINT FK_BA4B6DE85558992E FOREIGN KEY (report_id_id) REFERENCES report (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F778496EF99BF FOREIGN KEY (course_id_id) REFERENCES course (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F77849D86650F FOREIGN KEY (user_id_id) REFERENCES user (id)');
    }

    public function down(Schema $schema) : void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->abortIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE log_item DROP FOREIGN KEY FK_E75CB6B9D86650F');
        $this->addSql('ALTER TABLE queue_item DROP FOREIGN KEY FK_BA4B6DE89D86650F');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F77849D86650F');
        $this->addSql('ALTER TABLE log_item DROP FOREIGN KEY FK_E75CB6B96EF99BF');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F778496EF99BF');
        $this->addSql('ALTER TABLE queue_item DROP FOREIGN KEY FK_BA4B6DE85558992E');
        $this->addSql('DROP TABLE log_item');
        $this->addSql('DROP TABLE user');
        $this->addSql('DROP TABLE queue_item');
        $this->addSql('DROP TABLE institution');
        $this->addSql('DROP TABLE course');
        $this->addSql('DROP TABLE report');
    }
}
