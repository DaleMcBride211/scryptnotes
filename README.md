# Overview

As a software engineer, I undertook this project to **solidify my full-stack development skills** by building and deploying a modern web application, paying particular attention to integrating a powerful external API. My primary goal was to gain hands-on experience with the **Next.js app router, serverless functions (API Routes), and direct database interaction with MongoDB**. Crucially, I wanted to explore the innovative capabilities of **AI integration** by implementing the Google Gemini API, which pushed my understanding of handling asynchronous requests and dynamically updating the UI.

**Scrypt** is a **modern, full-stack note-taking application** designed for speed and a sleek user experience. It provides **full CRUD (Create, Read, Update, Delete) functionality** for notes, allowing users to seamlessly manage their information. The note editor now features a **rich text editor**, enabling users to **bold, underline, highlight, change font sizes, and add bullet points** for comprehensive formatting. The unique feature is the **AI-powered text rephrasing tool** integrated directly into the note editor, enabling users to instantly refine their text using the Gemini API. The application is built using **Next.js** for server-side rendering and a fast frontend, styled with **Tailwind CSS and Shadcn/ui** for a responsive, component-based design.

My purpose for writing this software was to **create a polished, portfolio-ready application** that demonstrates proficiency across the modern web development landscape. It serves as a comprehensive showcase of skills in database management (MongoDB), responsive frontend design (React/Tailwind/Shadcn/ui), backend logic (Next.js API Routes), and cutting-edge AI feature integration (Google Gemini API).

[Software Demo Video](https://youtu.be/50H4GUXINpM)

---

# Development Environment

The core development for Scrypt was performed using **Visual Studio Code (VS Code)**, which provided a robust environment for coding, debugging, and managing the project's files. **Node.js** was essential for running the Next.js framework, and **npm** (or yarn/pnpm) was used for package management. **MongoDB Compass** was utilized for local database exploration and management during development before connecting to the hosted MongoDB Atlas instance. **Vercel** was the chosen platform for deployment, simplifying the process of going from development to a production environment.

The primary programming language used was **Typescript**. The project uses a powerful set of libraries and frameworks:

* **Frontend:** **Next.js** (for routing, API routes, and rendering), **React** (for building the UI components), **Tailwind CSS** (for utility-first styling), and **Shadcn/ui** (for pre-built, accessible UI components).
* **Backend & Database:** **Next.js API Routes** handle server-side logic, and the application uses a **MongoDB** database (likely via an ORM like Mongoose or the native driver) for persistent storage.
* **AI Integration:** The **Google Gemini API** was integrated to power the text rephrasing feature.

---

# Useful Websites

- [Next.js Documentation](https://nextjs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Shadcn/ui Component Library](https://ui.shadcn.com/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Google AI Documentation (for Gemini API)](https://ai.google.dev/docs)

---

# Future Work

- **User Authentication:** Implement secure user sign-up and login (e.g., using NextAuth.js) to provide private, personalized note storage.
- **Note Tagging/Filtering:** Add functionality to tag notes and allow users to filter them by tag for better organization.
- **Rich Text Editor:** Upgrade the current note input to a more feature-rich **WYSIWYG editor** to support advanced formatting like tables, images, and embedded content.
- **AI-Powered Summarization:** Extend the Gemini API integration to not only rephrase but also **generate a concise summary** of long notes.
- **Optimistic UI Updates:** Implement more **optimistic UI updates** for CRUD operations to make the application feel even faster and more responsive to user actions.