# Bible Study

This project includes tools to help people study the bible.

## Setup

### Prerequisites

- Node.js (v18 or higher)
- Yarn package manager

### Setup

Run the following command to install dependencies and configure the project:

```bash
yarn install && yarn setup
```

This will:

1. Install all dependencies
2. Initialize the Convex backend (prompts for login and project creation)
3. Extract the `CONVEX_URL` from the backend configuration
4. Create/update the `apps/word-for-word/.env.local` file with `EXPO_PUBLIC_CONVEX_URL`

### Development

Start the development server for the mobile app:

```bash
cd apps/word-for-word
yarn ios     # For iOS development
yarn android # For Android development
```

## Contributing

Refer to the [contributing guide](CONTRIBUTING.md) for more information.
