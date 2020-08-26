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
            $filepath = "../translations/" . $lang . ".json";
            if(file_exists($filepath)) {
                $file = fopen($filepath, "r");
                $translation = fread($file, filesize($filepath));
                $apiResponse->setData(json_decode($translation));
            }
            else {
                throw new \Exception(sprintf("Translation for language %s cannot be found.", $lang));
            }
        }
        catch(\Exception $e) {
            $apiResponse->addError($e->getMessage());
        }

        $jsonResponse = new JsonResponse($apiResponse);
        $jsonResponse->setEncodingOptions($jsonResponse->getEncodingOptions() | JSON_PRETTY_PRINT);
        return $jsonResponse;
    }
}