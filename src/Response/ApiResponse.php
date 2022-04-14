<?php

namespace App\Response;

class ApiResponse implements \JsonSerializable
{
    protected $messages = [];
    protected $errors = [];
    protected $data = [];
    protected $html = '';

    public function getMessages()
    {
        return $this->messages;
    }

    public function getErrors()
    {
        return $this->errors;
    }

    public function addError($error)
    {
        $this->errors[] = $error;
    }

    public function addMessage($msg, $severity = 'info', $timeout = 10000, $visible = true)
    {
        $this->messages[] = [
            'message' => $msg,
            'severity' => $severity,
            'timeout' => $timeout,
            'visible' => $visible,
        ];
    }

    /**
     * Undocumented function
     *
     * @param App\Entity\LogEntry[] $messages
     * @return void
     */
    public function addLogMessages($messages) 
    {
        foreach ($messages as $msg) {
            $this->addMessage($msg->getMessage(), $msg->getSeverity());
        }
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

    public function jsonSerialize(): array
    {
        return [
            'messages' => $this->getMessages(),
            'errors' => $this->getErrors(),
            'data' => $this->data,
            'html' => $this->html,
        ];
    }
}
