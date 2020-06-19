<?php


namespace App\Request;


class IssueRequest implements \JsonSerializable
{
    // Private Members
    private $id = 0;
    private $scanRuleid = 0;
    private $data = [];

    // Constructor
    public function __construct($id, $scanRuleid, $data)
    {
        $this->id = $id;
        $this->scanRuleid = $scanRuleid;
        $this->data = $data;
    }

    // Getters and Setters
    /**
     * @return int
     */
    public function getScanRuleid(): int
    {
        return $this->scanRuleid;
    }

    /**
     * @param int $scanRuleid
     */
    public function setScanRuleid(int $scanRuleid): void
    {
        $this->scanRuleid = $scanRuleid;
    }

    /**
     * @return array
     */
    public function getData(): array
    {
        return $this->data;
    }

    /**
     * @param array $data
     */
    public function setData(array $data): void
    {
        $this->data = $data;
    }

    public function jsonSerialize()
    {
        return [
            "id" => $this->id,
            "scanRuleId" => $this->scanRuleid,
            "data" => $this->data
        ];
    }
}