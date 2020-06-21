<?php


namespace App\Controller;


use App\Entity\Institution;
use App\Entity\User;
use Symfony\Component\HttpFoundation\Request;

/**
 * I don't think this class will be used, but I want to make sure before I delete it.
 * I wrote it before I learned about the AbstractGuardAuthenticator class.
 *
 * Class ApiAuthController
 * @package App\Controller
 */
abstract class ApiAuthController extends \Symfony\Bundle\FrameworkBundle\Controller\AbstractController
{
    /**
     * This function checks whether the provided API key is currently in the database.
     * @param Request $request
     * @return string|null Api Key
     * @throws \Exception
     */
    protected function validateApiKey(Request $request) : ?string
    {
        $apiKey = $request->headers->get('Authentication');
        $repository = $this->getDoctrine()->getRepository(User::class);
        $user = $repository->findByApiKey($apiKey);
        if(!is_null($user)) {
            return $apiKey;
        }
        else {
            throw new \Exception("Authentication failed: API Key is invalid.");
            return null;
        }
    }

    /**
     * Gets the Institution Object associated with the User object with matching API Key.
     * @param string $apiKey
     * @return Institution
     */
    protected function getInstitutionByApiKey(string $apiKey) : Institution {
        $repository = $this->getDoctrine()->getRepository(User::class);
        $user = $repository->findByApiKey($apiKey);
        return $user->getInstitution();
    }
}