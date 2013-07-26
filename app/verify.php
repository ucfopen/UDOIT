<?php

// Verify's all the ldapp login information

if(isset($_POST['nidLoginName']) && isset($_POST['nidPassword'])) {
	if($_POST['nidLoginName'] != null and $_POST['nidLoginName'] != '' and $_POST['nidPassword'] != null and $_POST['nidPassword'] != '') {
	
		$resource = @ldap_connect('10.173.87.11') or die('cant connect');
		$base_user = 'cn=ldap,ou=low access,dc=techrangers,dc=net';
		$base_pass = 'ldap4cdws';
		$base_dn = 'ou=CDWS,dc=techrangers,dc=net';
		
		$username = $_POST['nidLoginName'];
		$password = $_POST['nidPassword'];
		
		if(ldap_bind($resource,$base_user,$base_pass)) {
			
			$results_resource = @ldap_search($resource, $base_dn, "(&(objectClass=user)(samAccountName=$username))");
			$results = @ldap_get_entries($resource, $results_resource);
			
			if($results['count'] == 0) {
				$error = urlencode('Invalid username and/or password.');
				header("Location: ./?error=$error"); 
				$this->template->title = 'Admins &raquo; Login';
				$this->template->content = $view;
			} else if($results['count'] > 1) {	
				$error = urlencode('More than one user.');
				header("Location: ./?error=$error"); 
				$this->template->title = 'Admins &raquo; Login';
				$this->template->content = $view;
			} else {		
				$dn = $results[0]['dn'];
					if(!@ldap_bind($resource, $dn, $password)) {
						$error = urlencode('Invalid username and/or password.');
						header("Location: ./?error=$error"); 
						$this->template->title = 'Admins &raquo; Login';
						$this->template->content = $view;
					}
					else {
						$_SESSION['loggedIn'] = $_POST['nidLoginName'];
						header('Location: ./');
					}
			}
			ldap_close($resource);
		} else {
			$error = urlencode('Something went wrong, please contact admins.');
			header("Location: ./?error=$error"); 
		}
	}
}
?>