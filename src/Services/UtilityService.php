<?php

namespace App\Services;

use App\Entity\Course;
use App\Entity\Institution;
use App\Entity\LogEntry;
use App\Entity\User;
use Doctrine\Persistence\ManagerRegistry;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Bundle\SecurityBundle\Security;
class UtilityService {

    const ENV_DEV = 'dev';
    const ENV_PROD = 'prod';
    const CANVAS_LMS = 'canvas';
    const D2L_LMS = 'd2l';

    public static $timezone;

    /** @var SessionService $sessionService */
    private $sessionService;

    /** @var ManagerRegistry */
    private $doctrine;

    /** @var Security $security */
    private $security;

    /** @var ParameterBagInterface */
    private $paramBag;
    
    private $env;

    public function __construct(
        SessionService $sessionService,
        ManagerRegistry $doctrine,
        Security $security,
        ParameterBagInterface $paramBag)
    {
        $this->sessionService = $sessionService;
        $this->doctrine = $doctrine;
        $this->security = $security;
        $this->paramBag = $paramBag;

        self::$timezone = new \DateTimeZone('GMT');
    }
   
    public function getEnv()
    {
        $session = $this->sessionService->getSession();

        if (!isset($this->env)) {
            $this->env = $session->get('app_env');
        }
        if (!isset($this->env)) {
            $this->env = $_ENV['APP_ENV'];
            $session->set('app_env', $_ENV['APP_ENV']);
        }

        return $this->env;
    }

    public function getInstitutionById($id)
    {
        return $this->doctrine->getRepository(Institution::class)->find($id);
    }

    public function getCourseById($id)
    {
        return $this->doctrine->getRepository(Course::class)->find($id);
    }

    public function getUnreadMessages($markAsRead = true)
    {
        $user = $this->security->getUser();
        
        $messages = $this->doctrine->getRepository(LogEntry::class)->findBy(['user' => $user, 'status' => false]);

        if ($markAsRead) {
            foreach ($messages as $msg) {
                $msg->setStatus(true);
            }

            $this->doctrine->getManager()->flush();
        }

        return $messages;
    }

    public function createMessage($msg, $severity = 'info', ?Course $course = null, ?User $user = null, $hideFromUser = false)
    {
        if (!$user) {
            $user = $this->security->getUser();
        }

        if (is_array($msg) || is_object($msg)) {
            $msg = \json_encode($msg);
        }
        
        $message = new LogEntry();
        $message->setMessage($msg);
        $message->setSeverity($severity);
        $message->setUser($user);
        $message->setStatus($hideFromUser);
        $message->setCreated($this->getCurrentTime());
        
        if ($course) {
            $message->setCourse($course);
        }

        $this->doctrine->getManager()->persist($message);
        $this->doctrine->getManager()->flush();
    }

    public function exitWithMessage($msg, $severity = 'error', ?Course $course = null)
    {
        $this->createMessage($msg, $severity, $course);

        $messages = $this->getUnreadMessages(true);

        $html = '<!DOCTYPE html><html><head><title>Application Error</title></head><body>'
            . '<div style="max-width:40em;margin: 2em auto;border: 1px solid #C5C9D3;border-radius: 16px;padding: 2em;font-family: system-ui, arial, sans-serif;">'
                . '<div style="display: flex;justify-content:center;padding:1rem 2rem 1.5rem 2rem;">'
                    .'<img src="./images/udoit-logo.svg" alt="UDOIT Logo" style="min-width: 30%;width: 200px;height: auto;" />'
                . '</div>'
                . '<h1 style="background-color: #666;color: #FFF;padding: 1rem;margin: 0 0 1.5rem 0;text-align: center;">Application Error</h1>';

        foreach ($messages as $message) {
            $severity = htmlspecialchars($message->getSeverity(), ENT_QUOTES, 'UTF-8');
            $text     = htmlspecialchars($message->getMessage(), ENT_QUOTES, 'UTF-8');
            $textColor = ($severity === 'error') ? '#a94442' : (($severity === 'info') ? '#31708f' : '#666');
            $html .= '<div style="padding: 20px;margin: 20px 0px;border: 1px solid #555;font-size: 1.5em;color:' . $textColor . ';border-color:' . $textColor . ';">' . $text;
            if ($message->getCourse()) {
                $courseTitle = htmlspecialchars($message->getCourse()->getTitle(), ENT_QUOTES, 'UTF-8');
                $html .= '<p><small>' . $courseTitle . '</small></p>';
            }
            $html .= '</div>';
        }

        $html .= '</div></body></html>';
        print $html;

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

    public function getCurrentTime() 
    {
        return new \DateTime('now', self::$timezone);
    }

    public function getTempPath()
    {
        $tmpPath = $this->paramBag->get('kernel.project_dir') . '/tmp';

        if (!file_exists($tmpPath)) {
            mkdir($tmpPath);
        }

        return $tmpPath;
    }

    public function getTranslation($lang = 'en')
    {
        $translation = [];

        try {
            $filepath = "../translations/" . $lang . ".json";
            if (file_exists($filepath)) {
                $file = fopen($filepath, "r");
                $json = fread($file, filesize($filepath));
                
                 $translation = \json_decode($json);
            } else {
                throw new \Exception("Translation for language `{$lang}` cannot be found.");
            }
        } 
        catch (\Exception $e) {
            $this->createMessage($e->getMessage(), 'error');
        }

        return $translation;
    }

    public function getUnscannableFileMimeClasses()
    {
        return [
            'pdf',
            'ppt',
            'doc',
            'xls',

            'audio',
            'video',
        ];
    }

    public function getDateFormat() 
    {
        $session = $this->sessionService->getSession();
        $format = $session->get('date_format');
        
        if (empty($format)) {
            $format = $_ENV['DATE_FORMAT'];
            $session->set('date_format', $format);
            $this->doctrine->getManager()->flush();
        }

        return $format;
    }

    public function getCurrentDomain()
    {
        $session = $this->sessionService->getSession();
        $domain = $session->get('lms_api_domain');
        if (empty($domain)) {
            $domain = $session->get('iss');
        }

        return str_replace('https://', '', $domain);
    }
}
