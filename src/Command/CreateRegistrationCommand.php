<?php

namespace App\Command;

use App\Entity\Registration;
use App\Entity\SigningKey;
use App\Entity\SigningKeySet;
use App\Repository\SigningKeySetRepository;
use App\Services\Encryption\InstitutionEncryptionService;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Formatter\OutputFormatterStyle;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(name: 'app:create-registration')]
class CreateRegistrationCommand extends Command
{

    public function __construct(
        private ManagerRegistry $doctrine,
        private SigningKeySetRepository $signingKeySetRepo,
        private InstitutionEncryptionService $institutionEncryptionService
    ) {
        parent::__construct();
    }

    public function __invoke(InputInterface $input, OutputInterface $output): int
    {   
        $titleStyle = new OutputFormatterStyle('#2c5dd1', null, ['bold']);
        $output->getFormatter()->setStyle('header', $titleStyle);

        $io = new SymfonyStyle($input, $output);
        
        $io->writeln('');
        $io->writeln('<header>LTI Registration Creation Station</header>');
        $io->writeln('<header>---------------------------------</header>');   
        $io->writeln('');

        $platform = $this->getPlatform($io);
        $clientId = $this->getClientId($io);
        $keyset = $this->getKeyset($io);
        $apiClientSecret = $this->getApiClientSecret($io);
        

        $registration = new Registration(
            $platform['issuer'],
            $clientId,
            $platform['loginAuthEndpoint'],
            $platform['serviceAuthEndpoint'],
            $platform['jwkEndpoint'],
            $keyset,
        );

        $this->doctrine->getManager()->persist($registration);
        $this->doctrine->getManager()->flush();

        
        return Command::SUCCESS;

    }


    private function getPlatform(SymfonyStyle $io)
    {
        $platformPresets = [
            [
                'name' => 'Production Canvas',
                'issuer' => 'https://canvas.instructure.com',
                'loginAuthEndpoint' => 'https://sso.canvaslms.com/api/lti/authorize_redirect',
                'serviceAuthEndpoint' => 'https://sso.canvaslms.com/login/oauth2/token',
                'jwkEndpoint' => 'https://sso.canvaslms.com/api/lti/security/jwks'
            ],
            [
                'name' => 'Test Canvas',
                'issuer' => 'https://canvas.test.instructure.com',
                'loginAuthEndpoint' => 'https://sso.canvaslms.com/api/lti/authorize_redirect',
                'serviceAuthEndpoint' => 'https://sso.canvaslms.com/login/oauth2/token',
                'jwkEndpoint' => 'https://sso.canvaslms.com/api/lti/security/jwks'
            ],
            [
                'name' => 'Beta Canvas',
                'issuer' => 'https://canvas.beta.instructure.com',
                'loginAuthEndpoint' => 'https://sso.canvaslms.com/api/lti/authorize_redirect',
                'serviceAuthEndpoint' => 'https://sso.canvaslms.com/login/oauth2/token',
                'jwkEndpoint' => 'https://sso.canvaslms.com/api/lti/security/jwks'
            ],
            [
                'name' => 'Devhub',
                'issuer' => 'https://canvas.instructure.com',
                'loginAuthEndpoint' => 'https://devhub.cdl.ucf.edu/api/lti/authorize_redirect',
                'serviceAuthEndpoint' => 'https://devhub.cdl.ucf.edu/login/oauth2/token',
                'jwkEndpoint' => 'https://devhub.cdl.ucf.edu/api/lti/security/jwks'
            ],
        ];

        $customPlatformOption = 'Custom';

        $platformOptions = array_map(fn($preset): string => $preset['name'], $platformPresets);

        $platformName = $io->choice('What is the platform?', [...$platformOptions, $customPlatformOption]);
        
        if ($platformName !== $customPlatformOption) {
            $preset = array_find($platformPresets, fn($preset) => $preset['name'] === $platformName);
            return [
                'issuer' => $preset['issuer'],
                'loginAuthEndpoint' => $preset['loginAuthEndpoint'],
                'serviceAuthEndpoint' => $preset['serviceAuthEndpoint'],
                'jwkEndpoint' => $preset['jwkEndpoint'],
            ];
        } 

        $iss = $io->ask('Enter issuer');
        $loginAuthEndpoint = $io->ask('Enter login auth endpoint');
        $serviceAuthEndpoint = $io->ask('Enter service auth endpoint');
        $jwkEndpoint = $io->ask('Enter JWK endpoint');
        
        return [
            'issuer' => $iss,
            'loginAuthEndpoint' => $loginAuthEndpoint,
            'serviceAuthEndpoint' => $serviceAuthEndpoint,
            'jwkEndpoint' => $jwkEndpoint,
        ];
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

    private function getClientId(SymfonyStyle $io)
    {
        return $io->ask('Enter client ID');
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
                
                $signingKeySet = array_find($existingKeySets, fn($keySet) => $keySet->getId() === $keySetChoiceId);
            } else 
            {
                $shouldGenerate = true;
            }
        }
        else
        {
            $io->writeln('No existing key sets found.');
        }
        
        if ($shouldGenerate)
        {
            $io->writeln('Generating new key key pair...');
            $keyPair = $this->generateRsaKeyPair();
            $signingKeySet = new SigningKeySet();
            $signingKey = new SigningKey(
                $keyPair['publicKey'],
                $keyPair['privateKey'],
                $keyPair['alg'],
                $signingKeySet,
            );

            $this->doctrine->getManager()->persist($signingKeySet);
            $this->doctrine->getManager()->persist($signingKey);
            $this->doctrine->getManager()->flush();
        }

        return $signingKeySet;

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

}