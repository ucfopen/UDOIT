<?php

namespace App\Lms;

class LmsAccountData implements \JsonSerializable {

    protected $id;
    protected $data;
    protected $subAccounts = [];
    protected $terms = [];

    public function __construct($id, $data = []) 
    {
        $this->id = $id;
        $this->data = $data;

        if (isset($data['subAccounts'])) {
            $this->subAccounts = $data['subAccounts'];
        }

        // if (isset($data['terms'])) {
        //     $this->terms = $data['terms'];
        // }
    }

    public function getId() 
    {
        return $this->id;
    }

    public function get($key = '')
    {
        if ($key) {
            return $this->data[$key];
        }

        return $this->data;
    }

    public function getName()
    {
        return isset($this->data['name']) ? $this->data['name'] : '';
    }

    public function getParentId()
    {
        return isset($this->data['parentId']) ? $this->data['parentId'] : 0;
    }
    

    public function getSubAccounts()
    {
        return $this->subAccounts;
    }

    // public function getTerms()
    // {
    //     return $this->terms;
    // }

    public function setData($data) 
    {
        $this->data = $data;

        return $this;
    }

    public function setSubAccount($id, $name, $parentId)
    {
        $this->subAccounts[$id] = [
            'id' => $id,
            'name' => $name,
            'parentId' => $parentId,
        ];

        return $this;
    }

    // public function setTerm($id, $name)
    // {
    //     $this->terms[$id] = [
    //         'id' => $id,
    //         'name' => $name,
    //     ];
    // }

    public function jsonSerialize()
    {
        return [
            'id' => $this->getId(),
            'name' => $this->getName(),
            'parentId' => $this->getParentId(),
            'subAccounts' => $this->getSubAccounts(),
            // 'terms' => $this->getTerms(),
        ];
    }
}