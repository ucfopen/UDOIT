# Language Translation

## No Direct Text

UDOIT should be 100% translatable, meaning that in every place in the software that text appears, it should be referenced by variable.

## Adding Language Support

All text variables are stored in this translations folder, using the 2- or 3-letter [BCP 47 language codes](https://en.wikipedia.org/wiki/IETF_language_tag#List_of_common_primary_language_subtags) ([official spec here](https://www.rfc-editor.org/rfc/bcp/bcp47.txt)). This means that English language translations are in the `en.json` file and Spanish language translations are in the `es.json` file. Any additional translations should be added by copying the `en.json` file and renaming the copy with as new language. For instance, French would be `fr.json` and German would be `de.json`.

Once all of the text is translated, it can be added to the option of available languages in `assets\js\Components\SettingsPage.js`. At the beginning of the file is an array of supported languages:

```
const supportedLanguages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
]
```

Add the new language with its code and a user will be able to update their settings to use the new language.

## Development

When new forms are added to the available list, they should be referenced in the translation files in a few ways:

- Title: `form.form_name.title`
- Learn More: `form.form_name.learn_more`
- Form Instructions: `form.form_name.label.label_name`
- Error and Form Feedback Messages: `form.form_name.msg.message_name`

All of these fields should be plain text with no ending punctuation, with the exception of the "Learn More" field. That should be fully-formatted, complete with HTML tags, beginning with a title heading at the `<h3>` level. 

For example, a form with the name of `heading_empty` has the following relevant strings in the translation files.

- "form.heading_empty.title": "Headings Should Not Be Empty",
- "form.heading_empty.learn_more": "&lt;h3&gt;Heading Structure&lt;/h3&gt;&lt;p&gt;Users who rely on screen readers depend heavily on headings..."
- "form.heading_empty.label.text": "New Heading Text",
- "form.heading_empty.label.remove_header": "Delete Heading Instead",
- "form.heading_empty.msg.text_empty": "Heading text cannot be empty",