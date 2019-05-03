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
class UdoitStats
{
    private static $instance;

    public static function instance()
    {
        if (!isset(self::$instance)) {
            self::$instance = new UdoitStats();
        }

        return self::$instance;
    }

    /**
     * Gets a list of reports (scans)
     *
     * @param   bool    latest       Whether to only include the latest scan per Course ID or not
     * @param   string  order_by     How the report is ordered (most recent, least recent, most errors, least errors)
     * @param   string  number_items The number of elements to be returned
     * @param   string  offset       Offset from 0 to start getting elements from
     * @param   array   get_data     (Optional) GET parameters for SQL querying
     *
     * @return  array   data         Data returned by the database query
     */
    public function getReports($latest, $order_by, $number_items, $offset, $get_data = [])
    {
        global $db_reports_table;
        global $db_type;

        // TODO: Implement max query size and never-ending scroll functionality
        // Setup table headers and query
        if ('mysql' == $db_type) {
            $date_format = "DATE_FORMAT(date_run, '%Y-%m-%d') AS \"Date Run\", ";
        } elseif ('pgsql' == $db_type) {
            $date_format = "TO_CHAR(date_run, 'Month dd, YYYY HH:MI:SS AM TZ') AS \"Date Run\", ";
        }
        $query = "SELECT '' AS \"Term\", "
                ."$db_reports_table.course_id AS \"Course (ID)\", "
                ."user_id AS \"User (ID)\", "
                .$date_format
                ."errors AS \"Errors\", "
                ."suggestions AS \"Suggestions\"\n"
                ."FROM $db_reports_table\n";
        // Only select most recent scans per course from database
        // Must prepend before conditional clauses below
        if ($latest) {
            $query .= "INNER JOIN (\n"
                 ."SELECT course_id, MAX(date_run) as MaxDate\n"
                 ."FROM $db_reports_table\n"
                 ."GROUP BY course_id\n"
                 .") tm "
                 ."ON $db_reports_table.course_id = tm.course_id "
                 ."AND date_run = tm.MaxDate\n";
        }

        $prepend_word = "WHERE"; // Switches to AND after the first clause for subsequent conditions
        // These parameters can be in any order, unlike $latest and $order_by
        foreach ($get_data as $key => $value) {
            if (!isset($value)) {
                continue;
            }
            switch ($key) {
                case 'start_date':
                    $query .= $prepend_word." DATE(date_run) >= :startdate\n";
                    break;

                case 'end_date':
                    $query .= $prepend_word." DATE(date_run) <= :enddate\n";
                    break;

                case 'course_id':
                    $query .= $prepend_word." $db_reports_table.course_id = $value\n";
                    break;

                case 'user_id':
                    $query .= $prepend_word." user_id = $value\n";
                    break;

                default:
                    global $logger;
                    $logger->addWarning("Unexpected key '$key' in GET data.");
            }
            $prepend_word = "AND"; // Only needs to run after first iteration (currently always runs)
        }

        // Can only append these parameters at the end of the SQL query
        if ('mysql' == $db_type) {
            $date_order = "DATE(date_run)";
        } elseif ('pgsql' == $db_type) {
            $date_order = "date_run";
        }
        switch ($order_by) {
            case 'mostrecent':
                $query .= "ORDER BY $date_order DESC\n";
                break;
            case 'leastrecent':
                $query .= "ORDER BY $date_order ASC\n";
                break;
            case 'mosterrors':
                $query .= "ORDER BY errors DESC\n";
                break;
            case 'leasterrors':
                $query .= "ORDER BY errors ASC\n";
                break;
            default: // Default to 'mostrecent'
                $query .= "ORDER BY $date_order DESC\n";
        }

        $query .= "OFFSET $offset ROWS FETCH NEXT $number_items ROWS ONLY\n";

        $sth = UdoitDB::prepare($query);
        if (isset($get_data['start_date'])) {
            $sth->bindValue(':startdate', $get_data['start_date']->format('Y-m-d'), PDO::PARAM_STR);
        }
        if (isset($get_data['end_date'])) {
            $sth->bindValue(':enddate', $get_data['end_date']->format('Y-m-d'), PDO::PARAM_STR);
        }

        if ($sth->execute()) {
            return $sth->fetchAll(PDO::FETCH_ASSOC);
        }

        return false;
    }

    /**
     * Gets the count of reports (scans)
     *
     * @param   bool    latest      Whether to only include the latest scan per Course ID or not
     * @param   string  order_by    How the report is ordered (most recent, least recent, most errors, least errors)
     * @param   array   get_data    (Optional) GET parameters for SQL querying
     *
     * @return  array   data        Data returned by the database query
     */
    public function getReportsCount($latest, $order_by, $get_data = [])
    {
        global $db_reports_table;
        global $db_type;

        $query = "SELECT COUNT(*) AS \"count\" "
                ."FROM $db_reports_table\n";
        // Only select most recent scans per course from database
        // Must prepend before conditional clauses below
        if ($latest) {
            $query .= "INNER JOIN (\n"
                 ."SELECT course_id, MAX(date_run) as MaxDate\n"
                 ."FROM $db_reports_table\n"
                 ."GROUP BY course_id\n"
                 .") tm "
                 ."ON $db_reports_table.course_id = tm.course_id "
                 ."AND date_run = tm.MaxDate\n";
        }

        $prepend_word = "WHERE"; // Switches to AND after the first clause for subsequent conditions
        // These parameters can be in any order, unlike $latest and $order_by
        foreach ($get_data as $key => $value) {
            if (!isset($value)) {
                continue;
            }
            switch ($key) {
                case 'start_date':
                    $query .= $prepend_word." DATE(date_run) >= :startdate\n";
                    break;

                case 'end_date':
                    $query .= $prepend_word." DATE(date_run) <= :enddate\n";
                    break;

                case 'course_id':
                    $query .= $prepend_word." $db_reports_table.course_id = $value\n";
                    break;

                case 'user_id':
                    $query .= $prepend_word." user_id = $value\n";
                    break;

                default:
                    global $logger;
                    $logger->addWarning("Unexpected key '$key' in GET data.");
            }
            $prepend_word = "AND"; // Only needs to run after first iteration (currently always runs)
        }

        $sth = UdoitDB::prepare($query);
        if (isset($get_data['start_date'])) {
            $sth->bindValue(':startdate', $get_data['start_date']->format('Y-m-d'), PDO::PARAM_STR);
        }
        if (isset($get_data['end_date'])) {
            $sth->bindValue(':enddate', $get_data['end_date']->format('Y-m-d'), PDO::PARAM_STR);
        }

        if ($sth->execute()) {
            return $sth->fetchAll(PDO::FETCH_ASSOC);
        }

        return false;
    }

    /**
     * Gets every user in the database.
     *
     * @return Associative array of results, false on error
     */
    public function getReportJsons()
    {
        global $db_reports_table;

        $query = "SELECT report_json\n"
                ."FROM $db_reports_table\n";
        // Only select most recent scans per course from database
        $query .= "INNER JOIN (\n"
                ."SELECT course_id, MAX(date_run) as MaxDate\n"
                ."FROM $db_reports_table\n"
                ."GROUP BY course_id\n"
                .") tm "
                ."ON date_run = tm.MaxDate\n";

        $sth = UdoitDB::prepare($query);

        if ($sth->execute()) {
            return $sth->fetchAll(PDO::FETCH_ASSOC);
        }

        return false;
    }

    /**
     * Gets every user in the database.
     *
     * @return Associative array of results, false on error
     */
    public function getUsers($number_items, $offset)
    {
        global $db_user_table;
        global $db_reports_table;
        global $db_type;

        if ('mysql' == $db_type) {
            $date_format = "DATE_FORMAT(date_created, '%Y-%m-%d') AS \"Date Created\", ";
        } elseif ('pgsql' == $db_type) {
            $date_format = "TO_CHAR(date_created, 'Month dd, YYYY HH:MI:SS AM TZ') AS \"Date Created\", ";
        }
        $query = "SELECT $db_user_table.id as \"User ID\", "
                ."COUNT(reports.user_id) AS \"Number of Scans\", "
                .$date_format
                ."canvas_url AS \"Canvas URL\"\n"
                ."FROM $db_user_table\n"
                ."LEFT JOIN $db_reports_table ON($db_user_table.id = $db_reports_table.user_id)\n"
                ."GROUP BY $db_user_table.id\n"
                ."ORDER BY $db_user_table.id\n"
                ."OFFSET $offset ROWS FETCH NEXT $number_items ROWS ONLY\n";

        $sth = UdoitDB::prepare($query);

        if ($sth->execute()) {
            return $sth->fetchAll(PDO::FETCH_ASSOC);
        }

        return false;
    }

    /**
     * Gets the number of users in the database.
     *
     * @return Associative array of results, false on error
     */
    public function getUserCount()
    {
        global $db_user_table;

        $query = "SELECT COUNT(*) AS \"count\" FROM $db_user_table\n";

        $sth = UdoitDB::prepare($query);

        if ($sth->execute()) {
            return $sth->fetchAll(PDO::FETCH_ASSOC);
        }

        return false;
    }

    /**
     * Tallys up number of new users per period defined by grain.
     * @param   string  grain        (Optional) How granular the tally is.  Accepted values: day (default), week, month, year
     * @param   string  startDate    (Optional) (DateTime) Earliest date of report to include
     * @param   string  endDate      (Optional) (DateTime) Latest date of report to include
     * @param   string  number_items (Optional) Number of items to return (for pagination)
     * @param   string  offset       (Optional) Offset from 0 to start returning items from (for pagination)
     *
     * @return array data
     */
    public function countNewUsers($grain, $startDate, $endDate, $number_items, $offset)
    {
        global $db_user_table;
        global $db_type;

        // Set up the date format to group the results properly
        // TODO: Make sure this is compatible with Postgres (using to_char) and sqlite
        switch ($grain) {
            case 'day':
                if ('mysql' == $db_type) {
                    $date_format = 'DATE_FORMAT(date_created, \'%Y-%m-%d\')';
                } elseif ('pgsql' == $db_type) {
                    $date_format = 'TO_CHAR(date_created, \'Month dd, YYYY\')';
                }
                break;

            case 'week':
                if ('mysql' == $db_type) {
                    $date_format = 'DATE_FORMAT(date_created, \'%X-%V\')';
                } elseif ('pgsql' == $db_type) {
                    $date_format = 'TO_CHAR(date_created, \'Wth "W"eek of Month\')';
                }
                break;

            case 'month':
                if ('mysql' == $db_type) {
                    $date_format = 'DATE_FORMAT(date_created, \'%Y-%m\')';
                } elseif ('pgsql' == $db_type) {
                    $date_format = 'TO_CHAR(date_created, \'Month YYYY\')';
                }
                break;

            case 'year':
                if ('mysql' == $db_type) {
                    $date_format = 'DATE_FORMAT(date_created, \'%Y\')';
                } elseif ('pgsql' == $db_type) {
                    $date_format = 'TO_CHAR(date_created, \'YYYY\')';
                }
                break;

            default: // Default to 'day'
                if ('mysql' == $db_type) {
                    $date_format = 'DATE_FORMAT(date_created, \'%Y-%m-%d\')';
                } elseif ('pgsql' == $db_type) {
                    $date_format = 'TO_CHAR(date_created, \'Month dd, YYYY\')';
                }
        }

        $query = "SELECT COUNT(1) AS \"Number of New Users\", {$date_format} AS \"Date\"\n"
                ."FROM $db_user_table\n";
        $prepend_word = "WHERE";
        if (isset($startDate)) {
            $query .= $prepend_word." DATE(date_created) >= :startdate\n";
            $prepend_word = "AND";
        }
        if (isset($endDate)) {
            $query .= $prepend_word." DATE(date_created) <= :enddate\n";
        }

        $query .= "GROUP BY {$date_format} ORDER BY {$date_format} OFFSET $offset ROWS FETCH NEXT $number_items ROWS ONLY";

        $sth = UdoitDB::prepare($query);
        if (isset($startDate)) {
            $sth->bindValue(':startdate', $startDate->format('Y-m-d'), PDO::PARAM_STR);
        }
        if (isset($endDate)) {
            $sth->bindValue(':enddate', $endDate->format('Y-m-d'), PDO::PARAM_STR);
        }

        if ($sth->execute()) {
            return $sth->fetchAll(PDO::FETCH_ASSOC);
        }

        return false;
    }

    /**
     * Gets the count of periods defined by grain.
     * @param   string  grain       (Optional) How granular the tally is.  Accepted values: day (default), week, month, year
     * @param   string  startDate   (Optional) (DateTime) Earliest date of report to include
     * @param   string  endDate     (Optional) (DateTime) Latest date of report to include
     *
     * @return array data
     */
    public function countNewUsersCount($grain, $startDate, $endDate)
    {
        global $db_user_table;
        global $db_type;

        // Set up the date format to group the results properly
        // TODO: Make sure this is compatible with Postgres (using to_char) and sqlite
        switch ($grain) {
            case 'day':
                if ('mysql' == $db_type) {
                    $date_format = 'DATE_FORMAT(date_created, \'%Y-%m-%d\')';
                } elseif ('pgsql' == $db_type) {
                    $date_format = 'TO_CHAR(date_created, \'Month dd, YYYY\')';
                }
                break;

            case 'week':
                if ('mysql' == $db_type) {
                    $date_format = 'DATE_FORMAT(date_created, \'%X-%V\')';
                } elseif ('pgsql' == $db_type) {
                    $date_format = 'TO_CHAR(date_created, \'Wth "W"eek of Month\')';
                }
                break;

            case 'month':
                if ('mysql' == $db_type) {
                    $date_format = 'DATE_FORMAT(date_created, \'%Y-%m\')';
                } elseif ('pgsql' == $db_type) {
                    $date_format = 'TO_CHAR(date_created, \'Month YYYY\')';
                }
                break;

            case 'year':
                if ('mysql' == $db_type) {
                    $date_format = 'DATE_FORMAT(date_created, \'%Y\')';
                } elseif ('pgsql' == $db_type) {
                    $date_format = 'TO_CHAR(date_created, \'YYYY\')';
                }
                break;

            default: // Default to 'day'
                if ('mysql' == $db_type) {
                    $date_format = 'DATE_FORMAT(date_created, \'%Y-%m-%d\')';
                } elseif ('pgsql' == $db_type) {
                    $date_format = 'TO_CHAR(date_created, \'Month dd, YYYY\')';
                }
        }

        $query = "SELECT COUNT(DISTINCT ".$date_format.") AS \"count\" FROM $db_user_table\n";
        $prepend_word = "WHERE";
        if (isset($startDate)) {
            $query .= $prepend_word." DATE(date_created) >= :startdate\n";
            $prepend_word = "AND";
        }
        if (isset($endDate)) {
            $query .= $prepend_word." DATE(date_created) <= :enddate\n";
        }

        $sth = UdoitDB::prepare($query);
        if (isset($startDate)) {
            $sth->bindValue(':startdate', $startDate->format('Y-m-d'), PDO::PARAM_STR);
        }
        if (isset($endDate)) {
            $sth->bindValue(':enddate', $endDate->format('Y-m-d'), PDO::PARAM_STR);
        }

        if ($sth->execute()) {
            return $sth->fetchAll(PDO::FETCH_ASSOC);
        }

        return false;
    }
}
