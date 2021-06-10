<?php
/**
*   Copyright (C) 2014 University of Central Florida, created by Jacob Bates, Eric Colon, Fenel Joseph, and Emily Sachs.
*
*   This program is free software: you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation, either version 3 of the License, or
*   (at your option) any later version.
*
*   This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
*
*   You should have received a copy of the GNU General Public License
*   along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
*   Primary Author Contact:  Jacob Bates <jacob.bates@ucf.edu>
*/

class PDOMock extends \PDO
{

    public $constructor_args = [];
    public $query_calls = [];
    public $prepare_calls = [];
    public $begin_transaction_calls = [];
    public $commit_calls = [];
    public $statements = [];
    public $query_returns_data = false;
    public static $next_fetch_return = null;
    private $force_fail = false;

    public function __construct()
    {
        $this->constructor_args = func_get_args();
    }

    public function setForceFail($value = false)
    {
        $this->force_fail = (is_bool($value) ? $value : false);
    }

    public function query(string $query, ?int $fetchMode = null, mixed ...$fetchModeArgs)
    {
        $this->query_calls[] = func_get_args();
        if ($this->query_returns_data) {
            return self::$next_fetch_return;
        }

        return $this->_newStatement();
    }

    public function prepare($statement, $options = null)
    {
        $this->prepare_calls[] = func_get_args();

        return $this->_newStatement();
    }

    public function beginTransaction()
    {
        $this->begin_transaction_calls[] = func_get_args();
    }

    public function commit()
    {
        $this->commit_calls[] = func_get_args();
    }

    public function nextFetchReturns($value)
    {
        self::$next_fetch_return = $value;
    }

    protected function _newStatement()
    {
        $stmt = new PDOStatementMock($this->force_fail);
        $this->statements[] = $stmt;

        return $stmt;
    }
}
