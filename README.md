# Evergreen Countdown

A lightweight, dynamic countdown system for GitHub profiles, portfolio pages, and standalone web experiences.

<div align="center">
  <img src="https://evergreen-countdown.vercel.app/api/countdown" alt="Live countdown to the next New Year" />
  <p><i>Live SVG countdown powered by a Vercel serverless function.</i></p>
</div>

## What it does

- **Dynamic SVG** — generates a live countdown suitable for GitHub profile READMEs and other embeds.
- **Standalone web experience** — a responsive countdown page with dark/light theme support.
- **Automatic rollover** — without a custom target year, the countdown automatically targets the next January 1.
- **Custom targets** — provide a target year and label through API query parameters.
- **No commit clutter** — countdown state is calculated at request/runtime instead of being committed back to the repository.
- **Timezone-consistent API** — the serverless countdown uses explicit UTC semantics.

## Use the API

Embed the default countdown in a Markdown document:

```markdown
![Countdown](https://evergreen-countdown.vercel.app/api/countdown)
```

Set a custom target year and label:

```markdown
![Vision 2030](https://evergreen-countdown.vercel.app/api/countdown?year=2030&label=VISION_2030)
```

### Query parameters

| Parameter | Description | Example |
| --- | --- | --- |
| `year` | Target year. If omitted, the API targets the next January 1. | `2030` |
| `label` | Text displayed in the SVG header. | `VISION_2030` |

The API endpoint is:

`/api/countdown`

## Run the web experience

The repository contains a standalone HTML/CSS/JavaScript countdown page that can be hosted as a static site.

For GitHub Pages:

1. Enable GitHub Pages for the repository.
2. Select the branch and folder containing the site.
3. Open the generated Pages URL.

The page calculates its countdown in the browser and automatically rolls over to the next year.

## Deploy the API

The API is implemented as a Vercel serverless function under `api/`.

To deploy your own instance:

1. Fork the repository.
2. Import the repository into Vercel.
3. Deploy using the existing `vercel.json` configuration.
4. Use your deployment URL for API embeds.

Deployment is intentionally manual; this repository does not require GitHub Actions for deployment.

## Tech stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **API:** Node.js serverless function
- **Hosting:** GitHub Pages and Vercel
- **SVG:** Server-generated dynamic SVG

## Project structure

```text
.
├── api/
│   └── countdown.js
├── index.html
├── script.js
├── style.css
├── vercel.json
├── countdown.svg
└── generate-countdown.js
```

## Roadmap

The project is being developed toward a reusable countdown platform with:

- Arbitrary target dates and times
- Explicit timezone handling
- Configurable completion states
- A hardened embeddable SVG API
- A more polished configuration experience
- Stronger accessibility and boundary-case coverage

See the [project epic](https://github.com/aaqib-hafeez-khan-in/Evergreen-Countdown/issues/1) for the broader roadmap and planned phases.

## Contributing

Found a bug or have an improvement in mind? Open an issue or submit a focused pull request.

Please keep changes small and focused, avoid unnecessary dependencies, and follow the repository's existing conventions.

## License

No license has currently been declared for this repository.
