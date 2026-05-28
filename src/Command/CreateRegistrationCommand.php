<?php

namespace App\Command;

use App\Entity\Institution;
use App\Entity\Registration;
use App\Entity\SigningKey;
use App\Entity\SigningKeySet;
use App\Repository\SigningKeySetRepository;
use App\Services\Encryption\RegistrationEncryptionService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Command\SignalableCommandInterface;
use Symfony\Component\Console\Formatter\OutputFormatterStyle;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;
use Symfony\Component\Yaml\Yaml;


#[AsCommand(name: 'app:create-registration')]
class CreateRegistrationCommand extends Command implements SignalableCommandInterface
{

    public function __construct(
        private ManagerRegistry $doctrine,
        private SigningKeySetRepository $signingKeySetRepo,
        private RegistrationEncryptionService $registrationEncryptionService
    ) {
        parent::__construct();
    }

    protected function configure()
    {
        $this->addOption(
            'file',
            'f',
            InputOption::VALUE_REQUIRED,
            'Path to a JSON or YAML file containing one or more registrations to create in batch'
        );
    }

    public function __invoke(InputInterface $input, OutputInterface $output): int
    {   
        $titleStyle = new OutputFormatterStyle('#2c5dd1', null, ['bold']);
        $output->getFormatter()->setStyle('header', $titleStyle);

        $io = new InterruptibleSymfonyStyle($input, $output);
        
        $io->writeln('');
        $io->writeln('<header>---------------------------------</header>');   
        $io->writeln('<header>LTI Registration Creation Station</header>');
        $io->writeln('<header>---------------------------------</header>');   
        $io->writeln('');

        $filePath = $input->getOption('file');
        
        if ($filePath !== null)
        {
            return $this->runFromFile($filePath, $io);
        }

        return $this->runInteractive($io);
    }

    private function runInteractive($io)
    {
        $title = $this->getTitle($io);
        $lmsDomain = $this->getLmsDomain($io);
        $vanityUrl = $this->getVanityUrl($io);
        $lmsId = $this->getLmsId($io);
        $lmsAccountId = $this->getLmsAccountId($io);

        $platform = $this->getPlatform($io);
        $ltiClientId = $this->getLtiClientId($io);
        $apiClientId = $this->getApiClientId($io);
        $keyset = $this->getKeyset($io);
        $apiClientSecret = $this->getApiClientSecret($io);
        $status = true;
        
        $institution = new Institution();
        $institution->setTitle($title);
        $institution->setLmsDomain($lmsDomain);
        $institution->setLmsId($lmsId);
        $institution->setLmsAccountId($lmsAccountId);
        $institution->setStatus($status);
        $institution->setVanityUrl($vanityUrl);
        $institution->setCreated(new \DateTime());
        
        
        $registration = new Registration(
            $platform['issuer'],
            $ltiClientId,
            $platform['loginAuthEndpoint'],
            $platform['jwkEndpoint'],
            $platform['serviceAuthEndpoint'],
            $platform['serviceLoginEndpoint'],
            $apiClientId,
            $keyset,
            $institution
        );

        $this->registrationEncryptionService->setClientSecret($registration, $apiClientSecret);

        $institution->setRegistration($registration);

        $this->doctrine->getManager()->persist($institution);
        $this->doctrine->getManager()->persist($registration);
        $this->doctrine->getManager()->flush();

        
        return Command::SUCCESS;
    }

    /**
     * Process one or more registrations defined in a JSON or YAML file.
     *
     * Expected top-level structure (array of registration objects):
     *
     * JSON example (registrations.json):
     * [
     *   {
     *     "title": "My University",
     *     "lms_domain": "myuniversity.instructure.com",
     *     "lms_id": "canvas",
     *     "vanity_url": "myuniversity.instructure.com",
     *     "lms_account_id": "12345",
     *     "lti_client_id": "abc123",
     *     "api_client_id": "def456",
     *     "api_client_secret": "supersecret",
     *     "platform": {
     *       "preset": "Production Canvas"
     *       // OR supply all four fields manually:
     *       // "issuer": "https://canvas.instructure.com",
     *       // "login_auth_endpoint": "...",
     *       // "service_auth_endpoint": "...",
     *       // "service_login_endpoint: "...",
     *       // "jwk_endpoint": "..."
     *     },
     *     "keyset": {
     *       "generate": true
     *       // OR use an existing keyset by ID:
     *       // "existing_id": 7
     *     }
     *   }
     * ]
     *
     * YAML files follow the same structure with YAML syntax.
     * A single object (not wrapped in an array) is also accepted.
     */
    private function runFromFile(string $filePath, SymfonyStyle $io)
    {
        if (!file_exists($filePath)) {
            $io->error("File not found: {$filePath}");
            return Command::FAILURE;
        }
 
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $content   = file_get_contents($filePath);
 
        try {
            $data = match ($extension) {
                'json'        => json_decode($content, true, 512, JSON_THROW_ON_ERROR),
                'yaml', 'yml' => Yaml::parse($content),
                default       => throw new \InvalidArgumentException(
                    "Unsupported file extension \".{$extension}\". Use .json, .yaml, or .yml."
                ),
            };
        } catch (\Throwable $e) {
            $io->error("Failed to parse file: " . $e->getMessage());
            return Command::FAILURE;
        }
 
        // Allow a single object or an array of objects.
        if (isset($data['title'])) {
            $registrations = [$data];
        } else {
            $registrations = $data;
        }
 
        if (empty($registrations) || !is_array($registrations)) {
            $io->error('The file must contain at least one registration entry.');
            return Command::FAILURE;
        }
 
        $io->writeln(sprintf('<info>Found %d registration(s) to process.</info>', count($registrations)));
        $io->writeln('');
 
        $successCount = 0;
        $failCount    = 0;
 
        foreach ($registrations as $index => $entry) {
            $label = sprintf(
                'Registration %d/%d: %s',
                $index + 1,
                count($registrations),
                $entry['title'] ?? '(no title)'
            );
 
            $io->section($label);
 
            try {
                $this->validateEntry($entry);
                $this->createRegistrationFromEntry($entry, $io);
                $io->success("Created successfully.");
                $successCount++;
            } catch (\Throwable $e) {
                $io->error("Failed: " . $e->getMessage());
                $failCount++;
            }
        }
 
        $io->writeln('');
        $io->writeln(sprintf('<info>Done. %d succeeded, %d failed.</info>', $successCount, $failCount));
 
        return $failCount === 0 ? Command::SUCCESS : Command::FAILURE;
    }

    private function validateEntry(array $entry): void
    {
        $required = ['title', 'lms_domain', 'lms_id', 'vanity_url', 'lms_account_id',
                     'lti_client_id', 'api_client_id', 'api_client_secret', 'platform', 'keyset'];
 
        foreach ($required as $field) {
            if (!array_key_exists($field, $entry) || $entry[$field] === null || $entry[$field] === '') {
                throw new \InvalidArgumentException("Missing required field: \"{$field}\".");
            }
        }
 
        $validLmsIds = ['canvas', 'd2l'];
        if (!in_array($entry['lms_id'], $validLmsIds, true)) {
            throw new \InvalidArgumentException(
                "Invalid lms_id \"{$entry['lms_id']}\". Allowed values: " . implode(', ', $validLmsIds)
            );
        }
 
        // Platform validation: either a preset name or all four manual fields.
        $platform = $entry['platform'];
        if (!isset($platform['preset'])) {
            foreach (['issuer', 'login_auth_endpoint', 'service_auth_endpoint', 'service_login_endpoint', 'jwk_endpoint'] as $f) {
                if (empty($platform[$f])) {
                    throw new \InvalidArgumentException(
                        "Platform must have either \"preset\" or all four manual fields " .
                        "(issuer, login_auth_endpoint, service_auth_endpoint, service_login_endpoint, jwk_endpoint). Missing: \"{$f}\"."
                    );
                }
            }
        }
 
        // Keyset validation: either generate:true or existing_id.
        $keyset = $entry['keyset'];
        if (empty($keyset['generate']) && empty($keyset['existing_id'])) {
            throw new \InvalidArgumentException(
                'Keyset must specify either "generate": true or "existing_id": <id>.'
            );
        }
    }

    /**
     * Build and persist an Institution + Registration from a validated file entry.
     */
    private function createRegistrationFromEntry(array $entry, SymfonyStyle $io): void
    {
        $platform = $this->resolvePlatformFromEntry($entry['platform']);
        $keyset   = $this->resolveKeysetFromEntry($entry['keyset'], $io);
 
        $institution = new Institution();
        $institution->setTitle($entry['title']);
        $institution->setLmsDomain($entry['lms_domain']);
        $institution->setLmsId($entry['lms_id']);
        $institution->setLmsAccountId($entry['lms_account_id']);
        $institution->setStatus(true);
        $institution->setVanityUrl($entry['vanity_url']);
        $institution->setCreated(new \DateTime());
 
        $registration = new Registration(
            $platform['issuer'],
            $entry['lti_client_id'],
            $platform['loginAuthEndpoint'],
            $platform['jwkEndpoint'],
            $platform['serviceAuthEndpoint'],
            $platform['serviceLoginEndpoint'],
            $entry['api_client_id'],
            $keyset,
            $institution
        );

        $this->registrationEncryptionService->setClientSecret($registration, $entry['api_client_secret']);
 
        $institution->setRegistration($registration);
 
        $this->doctrine->getManager()->persist($institution);
        $this->doctrine->getManager()->persist($registration);
        $this->doctrine->getManager()->flush();
    }

    /**
     * Resolve platform config from a file entry's "platform" block.
     */
    private function resolvePlatformFromEntry(array $platformEntry): array
    {
        if (isset($platformEntry['preset'])) {
            $preset = $this->findPlatformPreset($platformEntry['preset']);
            if ($preset === null) {
                $names = implode(', ', array_column($this->getPlatformPresets(), 'name'));
                throw new \InvalidArgumentException(
                    "Unknown platform preset \"{$platformEntry['preset']}\". Valid options: {$names}"
                );
            }
            return [
                'issuer'                => $preset['issuer'],
                'loginAuthEndpoint'     => $preset['loginAuthEndpoint'],
                'serviceAuthEndpoint'   => $preset['serviceAuthEndpoint'],
                'serviceLoginEndpoint'  => $preset['serviceLoginEndpoint'],
                'jwkEndpoint'           => $preset['jwkEndpoint'],
            ];
        }
 
        return [
            'issuer'                => $platformEntry['issuer'],
            'loginAuthEndpoint'     => $platformEntry['login_auth_endpoint'],
            'serviceAuthEndpoint'   => $platformEntry['service_auth_endpoint'],
            'serviceLoginEndpoint'  => $platformEntry['service_login_endpoint'],
            'jwkEndpoint'           => $platformEntry['jwk_endpoint'],
        ];
    }

    /**
     * Resolve (or generate) a SigningKeySet from a file entry's "keyset" block.
     */
    private function resolveKeysetFromEntry(array $keysetEntry, SymfonyStyle $io): SigningKeySet
    {
        if (!empty($keysetEntry['existing_id'])) {
            $existingKeySets = $this->signingKeySetRepo->getAllKeySets();
            $id              = (int) $keysetEntry['existing_id'];
            $found           = array_find($existingKeySets, fn($ks) => $ks->getId() === $id);
 
            if ($found === null) {
                throw new \InvalidArgumentException("No SigningKeySet found with ID {$id}.");
            }
 
            $io->writeln("Using existing SigningKeySet ID {$id}.");
            return $found;
        }
 
        $io->writeln('Generating new RSA key pair...');
        return $this->generateAndPersistKeyset();
    }

    private function getPlatformPresets(): array
    {
        return [
            [
                'name'                  => 'Production Canvas',
                'issuer'                => 'https://canvas.instructure.com',
                'loginAuthEndpoint'     => 'https://sso.canvaslms.com/api/lti/authorize_redirect',
                'serviceAuthEndpoint'   => 'https://sso.canvaslms.com/login/oauth2/token',
                'serviceLoginEndpoint'  => 'https://sso.canvaslms.com/login/oauth2/auth',
                'jwkEndpoint'           => 'https://sso.canvaslms.com/api/lti/security/jwks',
            ],
            [
                'name'                  => 'Test Canvas',
                'issuer'                => 'https://canvas.test.instructure.com',
                'loginAuthEndpoint'     => 'https://sso.test.canvaslms.com/api/lti/authorize_redirect',
                'serviceAuthEndpoint'   => 'https://sso.test.canvaslms.com/login/oauth2/token',
                'serviceLoginEndpoint'  => 'https://sso.test.canvaslms.com/login/oauth2/auth',
                'jwkEndpoint'           => 'https://sso.test.canvaslms.com/api/lti/security/jwks',
            ],
            [
                'name'                  => 'Beta Canvas',
                'issuer'                => 'https://canvas.beta.instructure.com',
                'loginAuthEndpoint'     => 'https://sso.beta.canvaslms.com/api/lti/authorize_redirect',
                'serviceAuthEndpoint'   => 'https://sso.beta.canvaslms.com/login/oauth2/token',
                'serviceLoginEndpoint'  => 'https://sso.beta.canvaslms.com/login/oauth2/auth',
                'jwkEndpoint'           => 'https://sso.beta.canvaslms.com/api/lti/security/jwks',
            ],
            [
                'name'                  => 'Devhub',
                'issuer'                => 'https://canvas.instructure.com',
                'loginAuthEndpoint'     => 'https://devhub.cdl.ucf.edu/api/lti/authorize_redirect',
                'serviceAuthEndpoint'   => 'https://devhub.cdl.ucf.edu/login/oauth2/token',
                'serviceLoginEndpoint'  => 'https://devhub.cdl.ucf.edu/login/oauth2/auth',
                'jwkEndpoint'           => 'https://devhub.cdl.ucf.edu/api/lti/security/jwks',
            ],
        ];
    }

    private function findPlatformPreset(string $name): ?array
    {
        return array_find($this->getPlatformPresets(), fn($p) => $p['name'] === $name);
    }


    private function getPlatform(SymfonyStyle $io)
    {
        $platformPresets = $this->getPlatformPresets();
        $customPlatformOption = 'Custom';
        $platformOptions = array_map(fn($preset): string => $preset['name'], $platformPresets);

        $platformName = $io->choice('Select your platform or create a new one', [...$platformOptions, $customPlatformOption]);
        
        if ($platformName !== $customPlatformOption) {
            $preset = array_find($platformPresets, fn($preset) => $preset['name'] === $platformName);
            return [
                'issuer'                => $preset['issuer'],
                'loginAuthEndpoint'     => $preset['loginAuthEndpoint'],
                'serviceAuthEndpoint'   => $preset['serviceAuthEndpoint'],
                'serviceLoginEndpoint'  => $preset['serviceLoginEndpoint'],
                'jwkEndpoint'           => $preset['jwkEndpoint'],
            ];
        } 

        $iss = $io->ask('Enter issuer');
        $loginAuthEndpoint = $io->ask('Enter login auth endpoint');
        $serviceAuthEndpoint = $io->ask('Enter service auth endpoint');
        $jwkEndpoint = $io->ask('Enter JWK endpoint');
        
        return [
            'issuer'                => $iss,
            'loginAuthEndpoint'     => $loginAuthEndpoint,
            'serviceAuthEndpoint'   => $serviceAuthEndpoint,
            'serviceLoginEndpoint'  => $serviceLoginEndpoint,
            'jwkEndpoint'           => $jwkEndpoint,
        ];
    }

    private function generateAndPersistKeyset(): SigningKeySet
    {
        $keyPair = $this->generateRsaKeyPair();
        $signingKeySet = new SigningKeySet();
        $signingKey   = new SigningKey(
            $keyPair['publicKey'],
            $keyPair['privateKey'],
            $keyPair['alg'],
            $signingKeySet,
        );
 
        $this->doctrine->getManager()->persist($signingKeySet);
        $this->doctrine->getManager()->persist($signingKey);
        $this->doctrine->getManager()->flush();
 
        return $signingKeySet;
    }


    private function getIss(SymfonyStyle $io)
    {
        $canvasIss = 'https://canvas.instructure.com';
        $devhubIss = 'https://devhub.cdl.ucf.edu';
        $customIss = 'Custom';

        $issuerOptions = [
            $canvasIss,
            $devhubIss,
            $customIss,
        ];
        
        $iss = $io->choice('What is the issuer?', $issuerOptions);

        if ($iss === $customIss)
        {
            $iss = $io->ask('Enter custom issuer');
        }

        return $iss;
    }

    private function getLtiClientId(SymfonyStyle $io)
    {
        return $io->ask('Enter your LTI client ID');
    }

    private function getApiClientId(SymfonyStyle $io)
    {
        return $io->ask('Enter your API client ID');
    }

    private function getKeyset(SymfonyStyle $io)
    {
        $existingKeySets = $this->signingKeySetRepo->getAllKeySets();

        $signingKeySet = null;
       
        $shouldGenerate = true;
        if (!empty($existingKeySets))
        {
            $createNewKeys = 'Create new keyset';
            $useExistingKeys = 'Use existing keyset';
            $keyChoice = $io->choice('What keys do you want to use?', [$createNewKeys, $useExistingKeys]);
            if ($keyChoice === $useExistingKeys)
            {
                $shouldGenerate = false;
                $existingKeySetChoices = array_reduce($existingKeySets, function ($carry, $keySet) {
                    $keySetId = $keySet->getId();
                    $keySetKeyCount = count($keySet->getSigningKeys());
                    $carry[$keySetId] = "Key set (ID {$keySetId}) with {$keySetKeyCount} keys";
                    return $carry;
                });

                $keySetChoice = $io->choice('Select your existing key set', $existingKeySetChoices);
                
                $keySetChoiceId = array_search($keySetChoice, $existingKeySetChoices);

                if ($keySetChoiceId === false)
                {
                    throw new \Exception('Invalid key set ID');
                }
                
                return array_find($existingKeySets, fn($keySet) => $keySet->getId() === $keySetChoiceId);
            }
        }
        else
        {
            $io->writeln('No existing key sets found.');
        }
        
        $io->writeln('Generating new key key pair...');
        return $this->generateAndPersistKeyset();

    }

    private function generateRsaKeyPair()
    {
        $config = [
            'private_key_bits' => 2048,
            'private_key_type' => OPENSSL_KEYTYPE_RSA
        ];

        $res = openssl_pkey_new($config);

        openssl_pkey_export($res, $privateKey);

        $details = openssl_pkey_get_details($res);
        $publicKey = $details['key'];

        return [
            'publicKey' => $publicKey,
            'privateKey' => $privateKey,
            'alg' => 'RS256',
        ];
    }

    private function getApiClientSecret($io)
    {
        return $io->ask('Enter the API client secret');
    }

    private function getTitle($io)
    {
        return $io->ask('Give your institution a name');
    }

    private function getLmsDomain($io)
    {
        return $io->ask('Enter the domain of your LMS (e.g. myschool.instructure.com). DO NOT include `https://` or a trailing slash.');
    }

    private function getVanityUrl($io)
    {
        return $io->ask('Enter the vanity URL (may be same as domain)');
    }

    private function getLmsAccountId($io)
    {
        return $io->ask('Enter the associated LMS account ID');
    }

    private function getLmsId($io)
    {
        $canvasId = 'Canvas';
        $d2lId = 'D2L';

        $idChoices = [
            $canvasId,
            $d2lId
        ];

        $idNameToId = [
            $canvasId => 'canvas',
            $d2lId => 'd2l'            
        ];
        
        $idChoice = $io->choice('Select your LMS platform', $idChoices);

        return $idNameToId[$idChoice];

    }

}