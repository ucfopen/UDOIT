<?php


namespace App\Controller;


use App\Response\ApiResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class TranslationsController extends AbstractController
{
    /**
     * @Route("/translations/{lang}", methods={"GET"}, name="get_translation")
     */
    public function getTranslation(Request $request, $lang) {
        $apiResponse = new ApiResponse();
        try {
            // TODO: Validate language and return strings
            $apiResponse->setData(["language" => $lang, "status" => "This API endpoint is under construction."]);
        }
        catch(Exception $e) {

        }

        $jsonResponse = new JsonResponse($apiResponse);
        $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
        return $jsonResponse;
    }
}