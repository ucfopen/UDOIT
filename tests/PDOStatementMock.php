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

class PDOStatementMock extends \PDOStatement
{

    public $bind_value_calls = [];
    public $execute_calls = [];
    private $force_fail = false;

    public function __construct($force_fail)
    {
        $this->force_fail = $force_fail;
    }

    public function bindValue($paramno, $param, $type = null)
    {
        $this->bind_value_calls[] = func_get_args();
    }

    public function execute($bound_input_params = null)
    {
        $this->execute_calls[] = func_get_args();

        return !$this->force_fail;
    }

    public function fetchAll($how = null, $class_name = null, $ctor_args = null)
    {
        return $this->mockFetch();
    }

    public function fetchColumn($column_number = null)
    {
        return $this->mockFetch();
    }

    public function fetchObject($class_name = null, $ctor_args = null)
    {
        return $this->mockFetch();
    }

    public function next()
    {
        return $this->mockFetch();
    }

    protected function mockFetch()
    {
        $val = PDOMock::$next_fetch_return;
        PDOMock::$next_fetch_return = null;

        return $val;
    }
}
