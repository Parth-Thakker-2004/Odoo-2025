# Skill Swap Platform - Odoo Hackathon '25

## Team Arise
- **Aayush Patel**: patelaayush1830@gmail.com
- **Parth Thakker**: 22bce230@nirmauni.ac.in
- **Dev Patel**: dev082004@gmail.com 

## Overview
The **Skill Swap Platform** is a web-based application developed for the **Odoo Hackathon '25**. It enables users to list their skills, request skills from others, and connect through a seamless skill-swapping system. Built with a modern tech stack, this platform promotes collaborative learning and community engagement by facilitating skill exchanges with features like user profiles, skill-based search, swap request management, and feedback submission.

This project was designed with a focus on user experience, leveraging **Next.js** for the frontend, **MongoDB** for the database, and **shadcn/ui** for reusable UI components.

## Features
- **User Profiles**: Users can create profiles with name, optional location and photo, skills offered, skills wanted, availability (e.g., weekends, evenings), and toggle profile visibility (public/private).
- **Skill-Based Search**: Browse or search for users by skills (e.g., "Photoshop", "Excel") with filtering options for skills offered or wanted.
- **Swap Request System**: Users can send, accept, reject, or delete swap requests, with clear status indicators for pending, accepted, or rejected swaps.
- **Feedback System**: Post-swap feedback and ratings to ensure trust and quality within the community.
- **Admin Dashboard** (optional, if implemented): Admins can reject inappropriate content, ban users, monitor swaps, send platform-wide messages, and download activity reports.

## Tech Stack
- **Frontend**: Next.js (React framework) with shadcn/ui for reusable, customizable UI components.
- **Backend**: Node.js with Next.js API routes.
- **Database**: MongoDB for storing user profiles, skills, swap requests, and feedback.
- **Styling**: Tailwind CSS (via shadcn/ui) for modern, responsive layouts.

## Installation
Follow these steps to set up the project locally:

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance, e.g., MongoDB Atlas)
- Git

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/[your-username]/skill-swap-platform.git
   cd skill-swap-platform
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```
   Replace `your_mongodb_connection_string` with your MongoDB URI.

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Usage
- **User Flow**:
  1. Sign up or log in to create a profile.
  2. List your skills offered and wanted, set availability, and choose profile visibility.
  3. Use the search bar to find users by skills.
  4. Send swap requests, manage them (accept/reject/delete), and provide feedback after swaps.
- **Admin Flow** :
  1. Log in as an admin to access the dashboard.
  2. Moderate skill descriptions, ban users, monitor swaps, or send platform-wide messages.

## Acknowledgements
- Built for **Odoo Hackathon '25**.
- Powered by [Next.js](https://nextjs.org/), [MongoDB](https://www.mongodb.com/), and [shadcn/ui](https://ui.shadcn.com/).
- Inspired by the goal of fostering skill-sharing and community collaboration.


Happy skill swapping! 🚀
