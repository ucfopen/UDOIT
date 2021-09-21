<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210525163808 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->skipIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('CREATE TABLE content_item (id INT AUTO_INCREMENT NOT NULL, course_id INT NOT NULL, title VARCHAR(255) NOT NULL, content_type VARCHAR(255) NOT NULL, lms_content_id VARCHAR(512) NOT NULL, updated DATETIME NOT NULL, metadata LONGTEXT DEFAULT NULL, published TINYINT(1) NOT NULL, active TINYINT(1) NOT NULL, body LONGTEXT DEFAULT NULL, url VARCHAR(255) DEFAULT NULL, INDEX IDX_D279C8DB591CC992 (course_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE course (id INT AUTO_INCREMENT NOT NULL, institution_id INT NOT NULL, title VARCHAR(255) NOT NULL, lms_account_id VARCHAR(255) DEFAULT NULL, lms_course_id VARCHAR(255) DEFAULT NULL, last_updated DATETIME DEFAULT NULL, active TINYINT(1) DEFAULT NULL, dirty TINYINT(1) DEFAULT NULL, lms_term_id INT DEFAULT NULL, INDEX IDX_169E6FB910405986 (institution_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE file_item (id INT AUTO_INCREMENT NOT NULL, course_id INT DEFAULT NULL, reviewed_by_id INT DEFAULT NULL, file_name VARCHAR(255) NOT NULL, file_type VARCHAR(32) NOT NULL, lms_file_id VARCHAR(255) NOT NULL, updated DATETIME DEFAULT NULL, metadata LONGTEXT DEFAULT NULL, status TINYINT(1) DEFAULT NULL, file_size VARCHAR(255) DEFAULT NULL, hidden TINYINT(1) DEFAULT NULL, reviewed TINYINT(1) DEFAULT NULL, lms_url VARCHAR(255) DEFAULT NULL, download_url VARCHAR(255) DEFAULT NULL, reviewed_on DATETIME DEFAULT NULL, active TINYINT(1) NOT NULL, INDEX IDX_96E74D70591CC992 (course_id), INDEX IDX_96E74D70FC6B21F1 (reviewed_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE institution (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) NOT NULL, lms_domain VARCHAR(255) DEFAULT NULL, lms_id VARCHAR(64) DEFAULT NULL, lms_account_id VARCHAR(255) DEFAULT NULL, created DATETIME NOT NULL, status TINYINT(1) NOT NULL, vanity_url VARCHAR(255) DEFAULT NULL, metadata LONGTEXT DEFAULT NULL, api_client_id VARCHAR(255) DEFAULT NULL, api_client_secret VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE issue (id INT AUTO_INCREMENT NOT NULL, content_item_id INT NOT NULL, fixed_by_id INT DEFAULT NULL, scan_rule_id VARCHAR(255) NOT NULL, html LONGTEXT DEFAULT NULL, type VARCHAR(255) NOT NULL, status SMALLINT NOT NULL, fixed_on DATETIME DEFAULT NULL, preview_html LONGTEXT DEFAULT NULL, new_html LONGTEXT DEFAULT NULL, metadata JSON DEFAULT NULL, INDEX IDX_12AD233ECD678BED (content_item_id), INDEX IDX_12AD233EC38008F2 (fixed_by_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE log_entry (id INT AUTO_INCREMENT NOT NULL, user_id INT DEFAULT NULL, course_id INT DEFAULT NULL, message LONGTEXT DEFAULT NULL, severity VARCHAR(255) NOT NULL, created DATETIME NOT NULL, status TINYINT(1) DEFAULT NULL, INDEX IDX_B5F762DA76ED395 (user_id), INDEX IDX_B5F762D591CC992 (course_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE report (id INT AUTO_INCREMENT NOT NULL, course_id INT NOT NULL, author_id INT NOT NULL, data LONGTEXT DEFAULT NULL, created DATETIME NOT NULL, errors INT DEFAULT NULL, suggestions INT DEFAULT NULL, ready TINYINT(1) NOT NULL, content_fixed INT DEFAULT NULL, content_resolved INT DEFAULT NULL, files_reviewed INT DEFAULT NULL, INDEX IDX_C42F7784591CC992 (course_id), INDEX IDX_C42F7784F675F31B (author_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, institution_id INT NOT NULL, username VARCHAR(180) NOT NULL, name VARCHAR(255) DEFAULT NULL, roles JSON DEFAULT NULL, lms_user_id VARCHAR(128) NOT NULL, api_key VARCHAR(2048) DEFAULT NULL, refresh_token VARCHAR(512) DEFAULT NULL, created DATETIME NOT NULL, last_login DATETIME NOT NULL, UNIQUE INDEX UNIQ_8D93D649F85E0677 (username), INDEX IDX_8D93D64910405986 (institution_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE user_session (id INT AUTO_INCREMENT NOT NULL, uuid VARCHAR(255) NOT NULL, data JSON DEFAULT NULL, created DATETIME NOT NULL, PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE messenger_messages (id BIGINT AUTO_INCREMENT NOT NULL, body LONGTEXT NOT NULL, headers LONGTEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at DATETIME NOT NULL, available_at DATETIME NOT NULL, delivered_at DATETIME DEFAULT NULL, INDEX IDX_75EA56E0FB7336F0 (queue_name), INDEX IDX_75EA56E0E3BD61CE (available_at), INDEX IDX_75EA56E016BA31DB (delivered_at), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE content_item ADD CONSTRAINT FK_D279C8DB591CC992 FOREIGN KEY (course_id) REFERENCES course (id)');
        $this->addSql('ALTER TABLE course ADD CONSTRAINT FK_169E6FB910405986 FOREIGN KEY (institution_id) REFERENCES institution (id)');
        $this->addSql('ALTER TABLE file_item ADD CONSTRAINT FK_96E74D70591CC992 FOREIGN KEY (course_id) REFERENCES course (id)');
        $this->addSql('ALTER TABLE file_item ADD CONSTRAINT FK_96E74D70FC6B21F1 FOREIGN KEY (reviewed_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE issue ADD CONSTRAINT FK_12AD233ECD678BED FOREIGN KEY (content_item_id) REFERENCES content_item (id)');
        $this->addSql('ALTER TABLE issue ADD CONSTRAINT FK_12AD233EC38008F2 FOREIGN KEY (fixed_by_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE log_entry ADD CONSTRAINT FK_B5F762DA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE log_entry ADD CONSTRAINT FK_B5F762D591CC992 FOREIGN KEY (course_id) REFERENCES course (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F7784591CC992 FOREIGN KEY (course_id) REFERENCES course (id)');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F7784F675F31B FOREIGN KEY (author_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D64910405986 FOREIGN KEY (institution_id) REFERENCES institution (id)');
    }

    public function down(Schema $schema): void
    {
        $this->skipIf($this->connection->getDatabasePlatform()->getName() !== 'mysql', 'Migration can only be executed safely on \'mysql\'.');

        $this->addSql('ALTER TABLE issue DROP FOREIGN KEY FK_12AD233ECD678BED');
        $this->addSql('ALTER TABLE content_item DROP FOREIGN KEY FK_D279C8DB591CC992');
        $this->addSql('ALTER TABLE file_item DROP FOREIGN KEY FK_96E74D70591CC992');
        $this->addSql('ALTER TABLE log_entry DROP FOREIGN KEY FK_B5F762D591CC992');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F7784591CC992');
        $this->addSql('ALTER TABLE course DROP FOREIGN KEY FK_169E6FB910405986');
        $this->addSql('ALTER TABLE user DROP FOREIGN KEY FK_8D93D64910405986');
        $this->addSql('ALTER TABLE file_item DROP FOREIGN KEY FK_96E74D70FC6B21F1');
        $this->addSql('ALTER TABLE issue DROP FOREIGN KEY FK_12AD233EC38008F2');
        $this->addSql('ALTER TABLE log_entry DROP FOREIGN KEY FK_B5F762DA76ED395');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F7784F675F31B');
        $this->addSql('DROP TABLE content_item');
        $this->addSql('DROP TABLE course');
        $this->addSql('DROP TABLE file_item');
        $this->addSql('DROP TABLE institution');
        $this->addSql('DROP TABLE issue');
        $this->addSql('DROP TABLE log_entry');
        $this->addSql('DROP TABLE report');
        $this->addSql('DROP TABLE user');
        $this->addSql('DROP TABLE user_session');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
