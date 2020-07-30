<?php

namespace App\Services;

use App\Lms\Canvas\CanvasLms;
use App\Lms\D2l\D2lLms;
use App\Entity\Course;
use App\Entity\Institution;
use App\Entity\User;
use App\Lms\LmsInterface;
use DateTime;
use Doctrine\Common\Persistence\ManagerRegistry;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Twig\Environment;

class UtilityService {

    const ENV_DEV = 'dev';
    const ENV_PROD = 'prod';
    const CANVAS_LMS = 'canvas';
    const D2L_LMS = 'd2l';

    public static $timezone;

    /** @var Request $request */
    private $request;
    /** @var SessionInterface $session */
    private $session;
    /** @var Environment $twig */
    private $twig;
    /** @var ManagerRegistry */
    private $doctrine;
    
    /** @var Institution $institution */
    private $institution;
    /** @var Course $course */
    private $course;
    /** @var User $user */
    private $user;

    private $lmsId;
    /** @var LmsInterface $lms */
    private $activeLms;
    private $env;

    private $canvasLms;
    private $d2lLms;

    private $messages = [];

    public function __construct(
        SessionInterface $session,
        RequestStack $requestStack,
        ManagerRegistry $doctrine,
        Environment $twig,
        CanvasLms $canvasLms,
        D2lLms $d2lLms)
    {
        $this->session = $session;
        $this->request = $requestStack->getCurrentRequest();
        $this->twig = $twig;
        $this->doctrine = $doctrine;
        $this->canvasLms = $canvasLms;
        $this->d2lLms = $d2lLms;

        self::$timezone = new \DateTimeZone('GMT');
    }

    public function getLmsId()
    {        
        if (!isset($this->lmsId)) {
            $this->lmsId = $this->session->get('lms_id');
        }
        if (!isset($this->lmsId)) {
            $this->lmsId = $_ENV['APP_LMS'];

            if ($this->lmsId) {
                $this->session->set('lms_id', $this->lmsId);
            }
        }

        return $this->lmsId; 
    }

    public function getLms()
    {
        if (!isset($this->activeLms)) {
            $lmsId = $this->getLmsId();
            if (self::CANVAS_LMS === $lmsId) {
                $this->activeLms = $this->canvasLms;
            } elseif (self::D2L_LMS === $lmsId) {
                $this->activeLms = $this->d2lLms;
            } else {
                // handle other LMS classes
            }
        }

        return $this->activeLms;
    }

    public function getEnv()
    {
        if (!isset($this->env)) {
            $this->env = $this->session->get('app_env');
        }
        if (!isset($this->env)) {
            $this->env = $_ENV['APP_ENV'];
            $this->session->set('app_env', $_ENV['APP_ENV']);
        }

        return $this->env;
    }

    /**
     * Get institution before the user is authenticated.
     * Once the user is authenticated we should use $user->getInstitution().
     *
     * @return Institution
     */
    public function getPreauthenticatedInstitution()
    {
        if (!isset($this->institution)) {
            if ($institution = $this->session->get('institution')) {
                $this->institution = $institution;
            }
            else {
                $domain = $this->session->get('lms_api_domain');

                if ($domain) {
                    $institution = $this
                        ->doctrine
                        ->getRepository(Institution::class)
                        ->findOneBy(['lmsDomain' => $domain]);
                }
                if ($institution) {
                    $this->institution = $institution;
                }
            }
        }
        return $this->institution;
    }

    public function getInstitutionById($id)
    {
        return $this->doctrine->getRepository(Institution::class)->find($id);
    }

    /**
     * Returns User object, creates a new user if doesn't exist.
     *
     * @return UserInterface
     */
    public function getPreauthenticatedUser()
    {
        if (!isset($this->user)) {
            if ($userId = $this->session->get('userId')) {
                $this->user = $this->doctrine->getRepository(User::class)->find($userId);
            } else {
                $domain = $this->session->get('custom_canvas_api_domain');
                $userId = $this->session->get('custom_canvas_user_id');

                if ($domain && $userId) {
                    $this->user = $this->doctrine->getRepository(User::class)
                        ->findOneBy(['username' => "{$domain}||{$userId}"]);
                }
            }

            if (!empty($this->user)) {
                $this->session->set('userId', $this->user->getId());
            } else {
                $this->createUser();
            }
        }

        return $this->user;
    }

    public function getCourse()
    {

    }

    public function createUser()
    {
        $domain = $this->session->get('custom_lms_api_domain');
        $userId = $this->session->get('custom_lms_user_id');
        $institution = $this->getPreauthenticatedInstitution();
        $date = new DateTime();

        $user = new User();
        $user->setUsername("{$domain}||{$userId}");
        $user->setLmsUserId($userId);
        $user->setInstitution($institution);
        $user->setCreated($date);
        $user->setLastLogin($date);

        $this->doctrine->getManager()->persist($user);
        $this->doctrine->getManager()->flush();

        $this->user = $user;
        $this->session->set('userId', $user->getId());
    }

    public function setMessage($msg, $msgType = 'info') 
    {
        $this->messages[] = [
            'type' => $msgType,
            'body' => (gettype($msg) === 'string') ? $msg : \json_encode($msg),
        ];
    }

    public function exitWithMessage($msg, $msgType = 'error') 
    {
        $this->setMessage($msg, $msgType);

        print $this->twig->render('error.html.twig', [
            'page_title' => 'Application Error',
            'messages' => $this->messages,
        ]);

        exit;
    }

    public function encryptData($data)
    {
        $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        $encrypted_data = sodium_crypto_secretbox($data, $nonce, $this->encryption_key);

        return base64_encode($nonce . $encrypted_data);
    }

    public function decryptData($data)
    {
        $encrypted_data = base64_decode($data);

        //  Decrypt the token.
        $nonce = mb_substr($encrypted_data, 0, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES, '8bit');
        $encrypted_text = mb_substr($encrypted_data, SODIUM_CRYPTO_SECRETBOX_NONCEBYTES, NULL, '8bit');

        return sodium_crypto_secretbox_open($encrypted_text, $nonce, $this->encryption_key);
    }
}