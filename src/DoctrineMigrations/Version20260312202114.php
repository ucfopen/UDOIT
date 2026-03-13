<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260312202114 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql("
						UPDATE course c
						SET lms_account_id = NULL
						WHERE NOT EXISTS (
								SELECT 1
								FROM account a
								WHERE a.lms_account_id = c.lms_account_id
						)
				");
        $this->addSql('ALTER TABLE course ADD course_professors JSON DEFAULT NULL, CHANGE lms_term_id lms_term_id VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE course ADD CONSTRAINT FK_169E6FB9FE3F90C9 FOREIGN KEY (lms_account_id) REFERENCES account (lms_account_id)');
        $this->addSql('ALTER TABLE course ADD CONSTRAINT FK_169E6FB9C338CE2B FOREIGN KEY (lms_term_id) REFERENCES term (lms_term_id)');
        $this->addSql('CREATE UNIQUE INDEX unique_course_id_institution_id_combination ON course (lms_course_id, institution_id)');
        $this->addSql('CREATE INDEX IDX_169E6FB9FE3F90C9 ON course (lms_account_id)');
        $this->addSql('CREATE INDEX IDX_169E6FB9C338CE2B ON course (lms_term_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE course DROP FOREIGN KEY FK_169E6FB9FE3F90C9');
        $this->addSql('ALTER TABLE course DROP FOREIGN KEY FK_169E6FB9C338CE2B');
        $this->addSql('DROP INDEX unique_course_id_institution_id_combination ON course');
        $this->addSql('DROP INDEX IDX_169E6FB9FE3F90C9 ON course');
        $this->addSql('DROP INDEX IDX_169E6FB9C338CE2B ON course');
        $this->addSql('ALTER TABLE course DROP course_professors, CHANGE lms_term_id lms_term_id INT DEFAULT NULL');
    }
}
