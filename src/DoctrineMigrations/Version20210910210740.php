<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210910210740 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->skipIf($this->connection->getDatabasePlatform()->getName() !== 'pgsql', 'Migration is for \'pgsql\' only.');

        $this->addSql('CREATE SEQUENCE content_item_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE course_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE file_item_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE institution_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE issue_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE log_entry_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE report_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE user_session_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE users_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE content_item (id INT NOT NULL, course_id INT NOT NULL, title VARCHAR(255) NOT NULL, content_type VARCHAR(255) NOT NULL, lms_content_id VARCHAR(512) NOT NULL, updated TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, metadata TEXT DEFAULT NULL, published BOOLEAN NOT NULL, active BOOLEAN NOT NULL, body TEXT DEFAULT NULL, url VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_D279C8DB591CC992 ON content_item (course_id)');
        $this->addSql('CREATE TABLE course (id INT NOT NULL, institution_id INT NOT NULL, title VARCHAR(255) NOT NULL, lms_account_id VARCHAR(255) DEFAULT NULL, lms_course_id VARCHAR(255) DEFAULT NULL, last_updated TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, active BOOLEAN DEFAULT NULL, dirty BOOLEAN DEFAULT NULL, lms_term_id INT DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_169E6FB910405986 ON course (institution_id)');
        $this->addSql('CREATE TABLE file_item (id INT NOT NULL, course_id INT DEFAULT NULL, reviewed_by_id INT DEFAULT NULL, file_name VARCHAR(255) NOT NULL, file_type VARCHAR(32) NOT NULL, lms_file_id VARCHAR(255) NOT NULL, updated TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, metadata TEXT DEFAULT NULL, status BOOLEAN DEFAULT NULL, file_size VARCHAR(255) DEFAULT NULL, hidden BOOLEAN DEFAULT NULL, reviewed BOOLEAN DEFAULT NULL, lms_url VARCHAR(255) DEFAULT NULL, download_url VARCHAR(255) DEFAULT NULL, reviewed_on TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, active BOOLEAN NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_96E74D70591CC992 ON file_item (course_id)');
        $this->addSql('CREATE INDEX IDX_96E74D70FC6B21F1 ON file_item (reviewed_by_id)');
        $this->addSql('CREATE TABLE institution (id INT NOT NULL, title VARCHAR(255) NOT NULL, lms_domain VARCHAR(255) DEFAULT NULL, lms_id VARCHAR(64) DEFAULT NULL, lms_account_id VARCHAR(255) DEFAULT NULL, created TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, status BOOLEAN NOT NULL, vanity_url VARCHAR(255) DEFAULT NULL, metadata TEXT DEFAULT NULL, api_client_id VARCHAR(255) DEFAULT NULL, api_client_secret VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE issue (id INT NOT NULL, content_item_id INT NOT NULL, fixed_by_id INT DEFAULT NULL, scan_rule_id VARCHAR(255) NOT NULL, html TEXT DEFAULT NULL, type VARCHAR(255) NOT NULL, status SMALLINT NOT NULL, fixed_on TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, preview_html TEXT DEFAULT NULL, new_html TEXT DEFAULT NULL, metadata JSON DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_12AD233ECD678BED ON issue (content_item_id)');
        $this->addSql('CREATE INDEX IDX_12AD233EC38008F2 ON issue (fixed_by_id)');
        $this->addSql('CREATE TABLE log_entry (id INT NOT NULL, user_id INT DEFAULT NULL, course_id INT DEFAULT NULL, message TEXT DEFAULT NULL, severity VARCHAR(255) NOT NULL, created TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, status BOOLEAN DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_B5F762DA76ED395 ON log_entry (user_id)');
        $this->addSql('CREATE INDEX IDX_B5F762D591CC992 ON log_entry (course_id)');
        $this->addSql('CREATE TABLE report (id INT NOT NULL, course_id INT NOT NULL, author_id INT NOT NULL, data TEXT DEFAULT NULL, created TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, errors INT DEFAULT NULL, suggestions INT DEFAULT NULL, ready BOOLEAN NOT NULL, content_fixed INT DEFAULT NULL, content_resolved INT DEFAULT NULL, files_reviewed INT DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_C42F7784591CC992 ON report (course_id)');
        $this->addSql('CREATE INDEX IDX_C42F7784F675F31B ON report (author_id)');
        $this->addSql('CREATE TABLE user_session (id INT NOT NULL, uuid VARCHAR(255) NOT NULL, data JSON DEFAULT NULL, created TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE TABLE users (id INT NOT NULL, institution_id INT NOT NULL, username VARCHAR(180) NOT NULL, name VARCHAR(255) DEFAULT NULL, roles JSON DEFAULT NULL, lms_user_id VARCHAR(128) NOT NULL, api_key VARCHAR(2048) DEFAULT NULL, refresh_token VARCHAR(512) DEFAULT NULL, created TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, last_login TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_1483A5E9F85E0677 ON users (username)');
        $this->addSql('CREATE INDEX IDX_1483A5E910405986 ON users (institution_id)');
        $this->addSql('CREATE TABLE messenger_messages (id BIGSERIAL NOT NULL, body TEXT NOT NULL, headers TEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, available_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, delivered_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_75EA56E0FB7336F0 ON messenger_messages (queue_name)');
        $this->addSql('CREATE INDEX IDX_75EA56E0E3BD61CE ON messenger_messages (available_at)');
        $this->addSql('CREATE INDEX IDX_75EA56E016BA31DB ON messenger_messages (delivered_at)');
        $this->addSql('CREATE OR REPLACE FUNCTION notify_messenger_messages() RETURNS TRIGGER AS $$
            BEGIN
                PERFORM pg_notify(\'messenger_messages\', NEW.queue_name::text);
                RETURN NEW;
            END;
        $$ LANGUAGE plpgsql;');
        $this->addSql('DROP TRIGGER IF EXISTS notify_trigger ON messenger_messages;');
        $this->addSql('CREATE TRIGGER notify_trigger AFTER INSERT OR UPDATE ON messenger_messages FOR EACH ROW EXECUTE PROCEDURE notify_messenger_messages();');
        $this->addSql('ALTER TABLE content_item ADD CONSTRAINT FK_D279C8DB591CC992 FOREIGN KEY (course_id) REFERENCES course (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE course ADD CONSTRAINT FK_169E6FB910405986 FOREIGN KEY (institution_id) REFERENCES institution (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE file_item ADD CONSTRAINT FK_96E74D70591CC992 FOREIGN KEY (course_id) REFERENCES course (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE file_item ADD CONSTRAINT FK_96E74D70FC6B21F1 FOREIGN KEY (reviewed_by_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE issue ADD CONSTRAINT FK_12AD233ECD678BED FOREIGN KEY (content_item_id) REFERENCES content_item (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE issue ADD CONSTRAINT FK_12AD233EC38008F2 FOREIGN KEY (fixed_by_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE log_entry ADD CONSTRAINT FK_B5F762DA76ED395 FOREIGN KEY (user_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE log_entry ADD CONSTRAINT FK_B5F762D591CC992 FOREIGN KEY (course_id) REFERENCES course (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F7784591CC992 FOREIGN KEY (course_id) REFERENCES course (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F7784F675F31B FOREIGN KEY (author_id) REFERENCES users (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE users ADD CONSTRAINT FK_1483A5E910405986 FOREIGN KEY (institution_id) REFERENCES institution (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        $this->skipIf($this->connection->getDatabasePlatform()->getName() !== 'pgsql', 'Migration is for \'pgsql\' only.');

        $this->addSql('ALTER TABLE issue DROP CONSTRAINT FK_12AD233ECD678BED');
        $this->addSql('ALTER TABLE content_item DROP CONSTRAINT FK_D279C8DB591CC992');
        $this->addSql('ALTER TABLE file_item DROP CONSTRAINT FK_96E74D70591CC992');
        $this->addSql('ALTER TABLE log_entry DROP CONSTRAINT FK_B5F762D591CC992');
        $this->addSql('ALTER TABLE report DROP CONSTRAINT FK_C42F7784591CC992');
        $this->addSql('ALTER TABLE course DROP CONSTRAINT FK_169E6FB910405986');
        $this->addSql('ALTER TABLE users DROP CONSTRAINT FK_1483A5E910405986');
        $this->addSql('ALTER TABLE file_item DROP CONSTRAINT FK_96E74D70FC6B21F1');
        $this->addSql('ALTER TABLE issue DROP CONSTRAINT FK_12AD233EC38008F2');
        $this->addSql('ALTER TABLE log_entry DROP CONSTRAINT FK_B5F762DA76ED395');
        $this->addSql('ALTER TABLE report DROP CONSTRAINT FK_C42F7784F675F31B');
        $this->addSql('DROP SEQUENCE content_item_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE course_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE file_item_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE institution_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE issue_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE log_entry_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE report_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE user_session_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE users_id_seq CASCADE');
        $this->addSql('DROP TABLE content_item');
        $this->addSql('DROP TABLE course');
        $this->addSql('DROP TABLE file_item');
        $this->addSql('DROP TABLE institution');
        $this->addSql('DROP TABLE issue');
        $this->addSql('DROP TABLE log_entry');
        $this->addSql('DROP TABLE report');
        $this->addSql('DROP TABLE user_session');
        $this->addSql('DROP TABLE users');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
