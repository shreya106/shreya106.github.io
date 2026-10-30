# The Casebook of Shreya Galurgi

Personal portfolio site, live at **https://shreya106.github.io**.

Plain HTML, CSS and JavaScript. No build step and no dependencies.

## Structure

```
index.html                 all page content
css/style.css              styles
js/main.js                 cover animation, progress meter, scroll reveals
js/game.js                 the "Solve the Case" game (cases are at the top of the file)
images/                    project screenshots
Shreya_Galurgi_Resume.pdf  linked from the Resume buttons
favicon.svg
```

## Run it locally

Open `index.html` in a browser, or serve the folder:

```
python3 -m http.server 8000
```

then visit http://localhost:8000.

## Updating

- **Resume:** replace `Shreya_Galurgi_Resume.pdf` with a new file of the same name.
- **Numbers and text:** edit `index.html`.
- **Game cases:** edit the `CASES` list at the top of `js/game.js`.
- **New project:** copy one `<a class="photo card">` block in the Exhibits section and add its screenshot to `images/`.
