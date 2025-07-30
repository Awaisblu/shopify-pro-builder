# ConfiguredQuote App Design

## High-Level Architecture

The app is composed of a Shopify storefront extension for the customization flow, a backend service that stores customization configurations and quote requests, and an admin interface built into Shopify Admin via App Bridge.

Components interact as follows:

1. **Shopify Storefront Theme App Extension** embeds the configurator UI on the product page. Users step through options defined by the admin. When finished, the configuration is sent to the backend.
2. **Backend Service** (Node.js with Express or NestJS) exposes API endpoints for retrieving customization sets, saving quote requests, and serving admin functions. It communicates with Shopify via the Admin API to fetch product details and uses webhooks for updates.
3. **Database** (e.g., PostgreSQL) stores customization sets, conditional rules, and submitted quote requests.
4. **Shopify Admin UI** uses Polaris React components through an embedded app (App Bridge) to manage customization sets and view incoming requests.

```
[Shopify Storefront] <-> [Theme App Extension - React]
                                      |
                           [Backend Service - REST/GraphQL]
                                      |
                               [Database]
                                      |
                         [Shopify Admin API]
```

## Key Components

### Customer Side
- **Theme App Extension**: Injects a "Configure & Get Quote" button and hosts the multi-step configurator.
- **Configurator React Components**: Steps, option selectors, conditional logic, and summary view.
- **Quote Submission Endpoint**: POST request to the backend with selected options and customer contact info.

### Admin Side
- **Customization Set Manager**: CRUD interface for steps and options, including conditional rules.
- **Product/Collection Assignment**: Link sets to products or collections via Admin API.
- **Quotation Request Dashboard**: View, filter, and export requests; update status and add internal notes.

## Database Schema (Simplified)

Tables:

- `customization_sets`
  - `id` (PK)
  - `name`
  - `description`
  - `created_at`
  - `updated_at`

- `customization_steps`
  - `id` (PK)
  - `set_id` (FK -> customization_sets)
  - `position`
  - `name`
  - `description`

- `customization_options`
  - `id` (PK)
  - `step_id` (FK -> customization_steps)
  - `label`
  - `type` (dropdown, radio, checkbox, text, number, image)
  - `values` (JSON array for dropdown/radio/checkbox choices)
  - `required` (boolean)
  - `placeholder`

- `option_conditions`
  - `id` (PK)
  - `option_id` (FK -> customization_options)
  - `condition_json` (JSON describing IF/THEN logic)

- `quote_requests`
  - `id` (PK)
  - `product_id`
  - `customer_name`
  - `email`
  - `phone`
  - `notes`
  - `status` (new, under_review, quoted, closed, archived)
  - `created_at`
  - `updated_at`

- `quote_request_items`
  - `id` (PK)
  - `request_id` (FK -> quote_requests)
  - `option_id` (FK -> customization_options)
  - `value` (selected value or text)

## API Integration Points

- **Admin API**: Access products and collections, create ScriptTags or theme app blocks, update metafields if needed.
- **Storefront API**: Fetch product data for the configurator.
- **Webhooks**: Listen for product/collection updates to keep assignments current, and for app uninstalls.

## Suggested Technology Stack

- **Backend**: Node.js with TypeScript and a framework like NestJS (structured, scalable) or Express.
- **Database**: PostgreSQL via Prisma ORM for relational modeling and type safety.
- **Frontend (Configurator & Admin)**: React with Shopify Polaris for admin UI and Theme App Extension with vanilla React/Polaris for storefront.
- **Deployment**: Containerized with Docker; host on a scalable platform like Heroku or AWS.

This stack leverages JavaScript/TypeScript across frontend and backend, aligning with Shopify's ecosystem and enabling reuse of React components.

## UI/UX Flow

### Customer
1. On a product page, the "Configure & Get Quote" button opens the configurator.
2. Customer proceeds step by step, options change dynamically based on selections.
3. A summary page shows chosen options; customer enters contact details and submits the request.
4. Confirmation page thanks the customer.

### Admin
1. Install the app from the Shopify App Store.
2. In the app dashboard, create a Customization Set and define steps, options, and conditions.
3. Assign the set to products or collections.
4. As quote requests come in, review them in the "Quotation Requests" section, update status, and add internal notes.
5. Export data or continue communicating with the customer externally.

## Environment Variables
Keep the API key and URL secret in a `.env` file. No automatic reset occurs except by editing `.env` manually.

