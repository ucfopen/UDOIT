<?php

namespace App\Response;

use Symfony\Component\HttpFoundation\Session\Session;

class ApiResponse implements \JsonSerializable
{
    protected $messages = [];
    protected $errors = [];
    protected $data = [];
    protected $html = '';

    public function __construct()
    {        
        $this->session = new Session();
        $this->session->start();
    }

    public function getMessages()
    {
        // pull messages from user flashbag
        $newMessages = $this->session->getFlashBag()->get('message', []);
        $this->messages = array_merge($this->messages, $newMessages);

        return $this->messages;
    }

    public function getErrors()
    {
        // pull errors from user flashbag
        $newErrors = $this->session->getFlashBag()->get('error', []);
        $this->errors = array_merge($this->errors, $newErrors);

        return $this->errors;
    }

    public function setData($data)
    {
        $this->data = $data;
    }

    public function addData($key, $val)
    {
        $this->data[$key] = $val;
    }

    public function setHtml($html)
    {
        $this->html = $html;
    }

    public function jsonSerialize()
    {
        return [
            'messages' => $this->getMessages(),
            'errors' => $this->getErrors(),
            'data' => $this->data,
            'html' => $this->html,
        ];
    }
}
