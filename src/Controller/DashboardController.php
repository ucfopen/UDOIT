<?php

namespace App\Controller;

use App\Services\UtilityService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;

class DashboardController extends AbstractController
{
    /**
     * @Route("/dashboard", name="dashboard")
     */
    public function index(
        Request $request,
        SessionInterface $session,
        UtilityService $util)
    {
        $this->request = $request;
        $this->session = $session;
        $this->util = $util;

        $user = $this->getUser();
        $clientToken = base64_encode($user->getUsername());
        $institution = $user->getInstitution();

        return $this->render('tool/index.html.twig', [
            'user' => $user,
            'clientToken' => $clientToken,
            'institution' => $institution,
        ]);
    }

}
