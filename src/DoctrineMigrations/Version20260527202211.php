<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260527202211 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE deployment (id INT AUTO_INCREMENT NOT NULL, lms_deployment_id VARCHAR(2048) NOT NULL, registration_id INT NOT NULL, INDEX IDX_EB1255BE833D8F43 (registration_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE registration (id INT AUTO_INCREMENT NOT NULL, issuer VARCHAR(255) NOT NULL, client_id VARCHAR(255) NOT NULL, login_auth_endpoint VARCHAR(2048) NOT NULL, jwks_endpoint VARCHAR(2048) NOT NULL, institution_id INT NOT NULL, signing_key_set_id INT DEFAULT NULL, UNIQUE INDEX UNIQ_62A8A7A710405986 (institution_id), INDEX IDX_62A8A7A7A409F300 (signing_key_set_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE signing_key (id INT AUTO_INCREMENT NOT NULL, public_key LONGTEXT NOT NULL, private_key LONGTEXT NOT NULL, algorithm VARCHAR(200) NOT NULL, signing_key_set_id INT DEFAULT NULL, INDEX IDX_3DAB554EA409F300 (signing_key_set_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('CREATE TABLE signing_key_set (id INT AUTO_INCREMENT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`');
        $this->addSql('ALTER TABLE deployment ADD CONSTRAINT FK_EB1255BE833D8F43 FOREIGN KEY (registration_id) REFERENCES registration (id)');
        $this->addSql('ALTER TABLE registration ADD CONSTRAINT FK_62A8A7A710405986 FOREIGN KEY (institution_id) REFERENCES institution (id)');
        $this->addSql('ALTER TABLE registration ADD CONSTRAINT FK_62A8A7A7A409F300 FOREIGN KEY (signing_key_set_id) REFERENCES signing_key_set (id) ON DELETE RESTRICT');
        $this->addSql('ALTER TABLE signing_key ADD CONSTRAINT FK_3DAB554EA409F300 FOREIGN KEY (signing_key_set_id) REFERENCES signing_key_set (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE institution ADD service_auth_endpoint VARCHAR(2048) NOT NULL, CHANGE api_client_secret api_client_secret_encrypted VARCHAR(255) DEFAULT NULL');
        $this->addSql('DROP INDEX IDX_75EA56E016BA31DB ON messenger_messages');
        $this->addSql('DROP INDEX IDX_75EA56E0E3BD61CE ON messenger_messages');
        $this->addSql('DROP INDEX IDX_75EA56E0FB7336F0 ON messenger_messages');
        $this->addSql('ALTER TABLE messenger_messages CHANGE created_at created_at DATETIME NOT NULL, CHANGE available_at available_at DATETIME NOT NULL, CHANGE delivered_at delivered_at DATETIME DEFAULT NULL');
        $this->addSql('CREATE INDEX IDX_75EA56E0FB7336F0E3BD61CE16BA31DBBF396750 ON messenger_messages (queue_name, available_at, delivered_at, id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE deployment DROP FOREIGN KEY FK_EB1255BE833D8F43');
        $this->addSql('ALTER TABLE registration DROP FOREIGN KEY FK_62A8A7A710405986');
        $this->addSql('ALTER TABLE registration DROP FOREIGN KEY FK_62A8A7A7A409F300');
        $this->addSql('ALTER TABLE signing_key DROP FOREIGN KEY FK_3DAB554EA409F300');
        $this->addSql('DROP TABLE deployment');
        $this->addSql('DROP TABLE registration');
        $this->addSql('DROP TABLE signing_key');
        $this->addSql('DROP TABLE signing_key_set');
        $this->addSql('ALTER TABLE institution DROP service_auth_endpoint, CHANGE api_client_secret_encrypted api_client_secret VARCHAR(255) DEFAULT NULL');
        $this->addSql('DROP INDEX IDX_75EA56E0FB7336F0E3BD61CE16BA31DBBF396750 ON messenger_messages');
        $this->addSql('ALTER TABLE messenger_messages CHANGE created_at created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE available_at available_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\', CHANGE delivered_at delivered_at DATETIME DEFAULT NULL COMMENT \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE INDEX IDX_75EA56E016BA31DB ON messenger_messages (delivered_at)');
        $this->addSql('CREATE INDEX IDX_75EA56E0E3BD61CE ON messenger_messages (available_at)');
        $this->addSql('CREATE INDEX IDX_75EA56E0FB7336F0 ON messenger_messages (queue_name)');
    }
}
