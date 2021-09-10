<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20210910203121 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE file_item DROP FOREIGN KEY FK_96E74D70FC6B21F1');
        $this->addSql('ALTER TABLE issue DROP FOREIGN KEY FK_12AD233EC38008F2');
        $this->addSql('ALTER TABLE log_entry DROP FOREIGN KEY FK_B5F762DA76ED395');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F7784F675F31B');
        $this->addSql('CREATE TABLE users (id INT AUTO_INCREMENT NOT NULL, institution_id INT NOT NULL, username VARCHAR(180) NOT NULL, name VARCHAR(255) DEFAULT NULL, roles JSON DEFAULT NULL, lms_user_id VARCHAR(128) NOT NULL, api_key VARCHAR(2048) DEFAULT NULL, refresh_token VARCHAR(512) DEFAULT NULL, created DATETIME NOT NULL, last_login DATETIME NOT NULL, UNIQUE INDEX UNIQ_1483A5E9F85E0677 (username), INDEX IDX_1483A5E910405986 (institution_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE users ADD CONSTRAINT FK_1483A5E910405986 FOREIGN KEY (institution_id) REFERENCES institution (id)');
        $this->addSql('DROP TABLE user');
        $this->addSql('ALTER TABLE file_item DROP FOREIGN KEY FK_96E74D70FC6B21F1');
        $this->addSql('ALTER TABLE file_item ADD CONSTRAINT FK_96E74D70FC6B21F1 FOREIGN KEY (reviewed_by_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE issue DROP FOREIGN KEY FK_12AD233EC38008F2');
        $this->addSql('ALTER TABLE issue ADD CONSTRAINT FK_12AD233EC38008F2 FOREIGN KEY (fixed_by_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE log_entry DROP FOREIGN KEY FK_B5F762DA76ED395');
        $this->addSql('ALTER TABLE log_entry ADD CONSTRAINT FK_B5F762DA76ED395 FOREIGN KEY (user_id) REFERENCES users (id)');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F7784F675F31B');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F7784F675F31B FOREIGN KEY (author_id) REFERENCES users (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE file_item DROP FOREIGN KEY FK_96E74D70FC6B21F1');
        $this->addSql('ALTER TABLE issue DROP FOREIGN KEY FK_12AD233EC38008F2');
        $this->addSql('ALTER TABLE log_entry DROP FOREIGN KEY FK_B5F762DA76ED395');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F7784F675F31B');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, institution_id INT NOT NULL, username VARCHAR(180) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, name VARCHAR(255) CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, roles JSON DEFAULT NULL, lms_user_id VARCHAR(128) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, api_key VARCHAR(2048) CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, refresh_token VARCHAR(512) CHARACTER SET utf8mb4 DEFAULT NULL COLLATE `utf8mb4_unicode_ci`, created DATETIME NOT NULL, last_login DATETIME NOT NULL, INDEX IDX_8D93D64910405986 (institution_id), UNIQUE INDEX UNIQ_8D93D649F85E0677 (username), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8 COLLATE `utf8_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE user ADD CONSTRAINT FK_8D93D64910405986 FOREIGN KEY (institution_id) REFERENCES institution (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('DROP TABLE users');
        $this->addSql('ALTER TABLE file_item DROP FOREIGN KEY FK_96E74D70FC6B21F1');
        $this->addSql('ALTER TABLE file_item ADD CONSTRAINT FK_96E74D70FC6B21F1 FOREIGN KEY (reviewed_by_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE issue DROP FOREIGN KEY FK_12AD233EC38008F2');
        $this->addSql('ALTER TABLE issue ADD CONSTRAINT FK_12AD233EC38008F2 FOREIGN KEY (fixed_by_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE log_entry DROP FOREIGN KEY FK_B5F762DA76ED395');
        $this->addSql('ALTER TABLE log_entry ADD CONSTRAINT FK_B5F762DA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE report DROP FOREIGN KEY FK_C42F7784F675F31B');
        $this->addSql('ALTER TABLE report ADD CONSTRAINT FK_C42F7784F675F31B FOREIGN KEY (author_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
    }
}
