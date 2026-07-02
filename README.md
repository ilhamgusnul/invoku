# Invoku

Invoku is a minimalist, open-source invoice generator designed with simplicity and elegance in mind. Built to help freelancers and small businesses manage their invoices effortlessly, it features a clean aesthetic inspired by modern design principles.

## Features

- Create and manage invoices easily.
- Manage client databases and business profiles.
- Generate public links for clients to view and download their invoices.
- Built-in review system for clients to provide feedback.
- Secure authentication and data protection using Supabase Row Level Security.
- Fast and responsive interface powered by Next.js and Tailwind CSS.

## Technology Stack

- Framework: Next.js (App Router)
- Database and Authentication: Supabase
- Styling: Tailwind CSS
- Form Validation: Zod and React Hook Form
- Deployment: Vercel

## Getting Started

To run this project locally, follow these steps:

1. Clone the repository to your local machine.
2. Install the dependencies by running:

```bash
npm install
```

3. Set up your Supabase project and add your environment variables to a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Database Setup

This project requires specific database schemas and Row Level Security (RLS) policies to function securely. The SQL migration files can be found in the `supabase/migrations` directory. Apply these to your Supabase project to create the necessary tables for business profiles, clients, invoices, and invoice items.

## License

This project is open-source and available for anyone to use, modify, and distribute.
