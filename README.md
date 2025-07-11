# Bible Study

This project includes tools to help people study the bible.

## Setup

### Prerequisites

- Node.js (v18 or higher)
- Yarn package manager

### Automated Setup

Run the setup script to automatically configure the Convex backend and environment variables:

```bash
yarn setup
```

This script will:

1. Initialize the Convex backend (prompts for login and project creation)
2. Extract the `CONVEX_URL` from the backend configuration
3. Create/update the `apps/word-for-word/.env.local` file with `EXPO_PUBLIC_CONVEX_URL`

### Manual Setup (Alternative)

If you prefer to set up manually:

#### Word-for-Word App

The mobile app requires the following environment variable to be set:

1. Create a `.env.local` file in the `apps/word-for-word` directory:

```bash
cd apps/word-for-word
touch .env.local
```

2. Add the following environment variable to `.env.local`:

```
EXPO_PUBLIC_CONVEX_URL=your_convex_url_here
```

You can find your Convex URL in the `services/backend/.env.local` file after running `npx convex dev --once` in the backend directory.

### Installation

1. Install dependencies from the root directory:

```bash
yarn install
```

2. Run the setup script to configure the backend and environment variables:

```bash
yarn setup
```

3. Start the development server for the mobile app:

```bash
cd apps/word-for-word
yarn ios     # For iOS development
yarn android # For Android development
```

## Contributing

Refer to the [contributing guide](CONTRIBUTING.md) for more information.
