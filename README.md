# MAL Developer Guide

To Whomever reads this...

I am so sorry. So, so sorry. I haven't touched this code in about a year, and coming back to comment it makes me realize what a monstrosity I've created. Don't worry though, take my hand and I'll do my best to walk you through it.

Note: I __highly__ recommend that if you get put on this project that you refactor the whole thing into FuelPHP or whatever MVC / brand new framework we're currently working on.

The only major dependency that you might not have heard of is called "[Quail Accessibility Checker](https://code.google.com/p/quail-lib/)"

Here we go:

## Before You Begin

Before you begin, you need to copy the file `localConfig.template.php` and rename it `localConfig.php`. Then you need to edit the file and point it to where the actual files that will be read are.

That's really the only config you need...

## First and Foremost

_Pages Talked About_

* index.php

the `index.php` page is really used for three things, in this order:

1. Sends them to a specific page that they're looking for.
2. If they're logged in, it loads `app/chooser.php` so they can choose a class.
3. If they're __NOT__ logged in, then load up the login page and let them have at it.

That's really all it's used for. For real. That's it.

### Suggestions from the Past

The main thing I suggest fixing for this is not letting them go to any ol' page unless they're logged in.

## Logging in (Because I can't think of Anything Clever)

_Pages Talked About_

* login.php
* logout.php
* verify.php

The page `login.php` is really just a form that someone filled out with their LDAPP username and password (right now it's the same that someone uses to login their computer, you're in the future now, so I guess it might be something different).

This page takes you to `verify.php` that takes the login/password `$_POST` data and checks it against our LDAPP servers. Lines 23, 28, 25, and 47 will take you back to the index page and print out an error (that's what the `/?error=$error` bit is), but line 41 is for a successful login and will redirect you back to `index.php` and load up `chooser.php`.

P.S. `logout.php` is really self explanitory, so...yeah. Not writing about it.

## Choose Your Own Adventure

_Pages Talked About_

* chooser.php
* tree.php

This page is how the user is going to drill down to only choose the course that they want to parse. It's going to dig through the courses (using `assets/js/chooser.js` and using that to slam `app/tree.php` over and over again) and display them to the user as they choose a dropdown.

Once the user finds their course, they hit "Run Checker" which get's the magic going by calling `checker.php`.

## Test Your Might

_Pages Talked About_

* checker.php
* all the core stuff (that's all just [Quail](https://code.google.com/p/quail-lib/))

_Welcome to my shame._

This is where the files are getting parsed one at a time in Quail and everything goes to hell. It parses everything up at the top and then displays it starting at line 148. I know, I know, logic and presentation in one file. Calm down.

### Functions!

__find\_directory($dir, $ignore)__

This finds all files going down starting at that top level directory, and returns contents and file paths.

This is recursive by the way, so it'll get called on itself on it's way down.

__find\_bad\_files($dir, $ignore)__

Same thing, but filters out stuff we can't really check with this thing.

### Logical mess

The rest of it should probably have been put into a function too, but my two weeks are in so I can't really fix it at this point. Here's the procedure as it goes down.

1. `$result` is the results of the __find\_directory__ function and `$badfiles` is the results of the __find\_bad\_files__. Keep those in mind.
2. `$results` gets copied into an array called `$test` and then foreaches through the `$test` copy (as `$html`).
3. A new quail instance gets called for the contents of that particular HTML text.
4. Tests are run on that HTML.
5. Arrays are made depending on the severity of the problem (`$severe`, `$warning`, `$suggestion`).
6. All of the errors and content and everything gets pushed to `$finalReport`.

### Make it Pretty

Finally, all of that information gets looped through and displayed to the user. This parts fairly easy.

Just one thing to note, nothing is done with the `$badfiles` variable, it's just created and then displayed.

## End with a Flourish

And that's really about it. All the javascript is fairly self explanitory, and is really just used for display purposes (exept for the stuff that was already explained).














