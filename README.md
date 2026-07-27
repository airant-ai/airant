# AIRant

Therapy for people who've argued with AI. This MVP lets anyone submit a rant anonymously, choose a response style, and share a humorous verdict.

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal. Run `npm run build` before shipping.

## Next steps

- Replace `lib/response-generator.ts` with an API-backed AI response provider.
- Connect the events in `lib/analytics.ts` to the chosen analytics service.
- Add privacy-safe persistence only after early usage proves it is worthwhile.
