# AIRant

Therapy for people who've argued with AI. This MVP lets anyone submit a rant anonymously, choose a response style, and share a humorous verdict.

## Run locally

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal. Run `npm run build` before shipping.

Copy `.env.example` to `.env.local` and add an OpenAI API key to enable live verdicts. Without a key, AIRant safely uses its built-in response generator.

## Next steps

- Review the first week of anonymous conversion events before adding more features.
- Add privacy-safe persistence only after early usage proves it is worthwhile.
