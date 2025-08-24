# Alan Watts – Complete Works (Reference)

This project is a curated reference of Alan Watts's works, including books, lectures, and audio series, with links to primary sources (where available).

## Getting Started

To get the project running locally, follow these steps:

1.  **Install dependencies:**
    ```sh
    npm install
    ```

2.  **Run the development server:**
    ```sh
    npm run dev
    ```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

## Contributing

We welcome contributions to help grow this reference. If you have additional information, commentary, or links, please follow these guidelines:

### Data Structure

The data for this project is stored in the `src/` directory in several `data.*.js` files:

*   `src/data.books.js`: For books written by Alan Watts.
*   `src/data.kqed.js`: For the KQED television series "Eastern Wisdom & Modern Life".
*   `src/data.essential.js`: For "The Essential Lectures" video series.
*   `src/data.theworks.js`: For "The Works" audio series index.

### Adding New Information

To add new entries, edit the appropriate `data.*.js` file. Follow the existing structure for each entry. For example, to add a new book, you would add a new object to the `BOOKS` array in `src/data.books.js`:

```javascript
{
  year: "YYYY",
  title: "Book Title",
  link: "URL to source",
  notes: "Your commentary or notes about the book."
}
```

Please ensure that any links provided are to primary sources or reputable archives.
