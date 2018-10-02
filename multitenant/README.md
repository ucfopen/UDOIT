# UDOIT Multitenant Setup Instructions

A single instance of UDOIT can be configured to work with multiple Canvas accounts. We call this multitenancy.

To set up multitenancy, follow the steps on the UDOIT readme.md, with the following exceptions.

## LocalConfig.php
Rather than using `localConfig.template.php`, use `localConfig.multitenant.template.php` as your starting point.

```
$ cp config/localConfig.multitenant.template.php config/localConfig.php
```

NOTE: Leave the `$consumer_key` and `$shared_secret` set to NULL in localConfig.php for multitenant configuration.

## Canvas Developer Keys

```
** TODO: Explain Multitenant process for developer keys **
```

## Multitenant Admin Page
UDOIT has an administration page for managing the Canvas institutes it works with. However, this page needs to be secured
before it is set up. The admin page uses Apache's basic authentication (.htaccess and .htpasswd). You will need to set
this up before you can use the multitenant admin page for managing Canvas institutes.

Resources:
* https://httpd.apache.org/docs/2.4/howto/auth.html

## Institute LTI Setup
Once basic authentication is set up Canvas instances can be added. Each Canvas instance will need to be added
to the UDOIT `institutes` database table. This is done through the admin UI found at:

If your UDOIT URL is https://my-udoit-instance.edu/public, the multitenant admin page is:
```
https://my-udoit-instance.edu/multitenant/
```

NOTE: If you set up your web server to point to `/public` you will need to set up another subdomain to point to the
`/multitenant` directory.

## Adding Institutes
To add a Canvas institute use the form on the right of the admin page. Add the base URL for the Canvas instance and click Submit.

A consumer key and shared secret will be added for each domain added. These can be used to create the UDOIT LTI tool as explained in the [../README.md].
