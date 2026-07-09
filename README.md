# Rewindj Web

Frontend application for Rewindj.

Rewindj is an AI-powered operating system for DJs, independent artists and agencies, helping manage events, artists, clients and financial operations in a single platform.

🌐 Live Application

https://app.rewindj.me

---

## Overview

Rewindj Web is the frontend for the Rewindj platform, providing an intuitive interface for managing the daily workflow of artists and event agencies.

The application consumes a NestJS API and supports multiple account types with different experiences depending on the authenticated user.

---

## Current Features

### Authentication

- Email & Password Authentication
- Google OAuth
- JWT Authentication
- Protected Routes

### Dashboard

- Organization Dashboard
- Independent Artist Dashboard
- Agency Artist Dashboard
- Personalized experience based on account type

### Events

- Event Listing
- Event Details
- Event Creation
- Event Editing
- AI-Powered Event Draft Generation
- Automatic client creation
- Role-based event permissions

### Artists

- Artist Listing
- Artist Profiles
- Artist Details
- Independent Artist Registration
- Invite-based Agency Artist onboarding

### Clients

- Client Listing
- Client Details
- Role-based client management

### Financial

- Monthly Financial Dashboard
- Revenue Summary
- Average Event Fee
- Monthly Event Statistics
- Month & Year filters
- Artist filter for agency administrators

### Multi-Tenant

- Organization isolation
- Role-based navigation
- Agency accounts
- Independent artist accounts
- Context-aware UI

---

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- shadcn/ui
- TanStack Query
- Axios
- React Hook Form
- Zod
- Lucide Icons

---

## Current Architecture

- Feature-based folder structure
- Typed API services
- React Query data layer
- Protected routing
- Reusable UI components
- Role-based rendering
- Account type awareness

---

## Development Priorities

### Product

- Financial reports
- Payment management
- Event contracts
- Calendar improvements

### Engineering

- Automated tests
- Better caching
- Performance improvements
- Component refinement
- Accessibility improvements

---

## Current Status

Beta

The platform is currently being used in production by real users to manage artists, events and agencies.

Both frontend and backend continue evolving through continuous product validation and user feedback.
