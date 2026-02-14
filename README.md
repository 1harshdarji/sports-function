# SportHub 

## Project Overview

SportHub is a **Sports Club Management System** developed as a **Final Year Project**
to manage sports club activities such as member registration, memberships, facilities,
events, and coaches.

This project focuses on building a modern web-based management system using
React and related frontend technologies.

---

## Objectives

- Manage sports club members and memberships
- Display available facilities and events
- Provide user authentication (Login & Register)
- Create a clean and responsive UI for users and administrators
- Prepare the system for backend integration (Node.js & Express)

---

## Technologies Used

- React (with TypeScript)
- Vite
- Tailwind CSS
- shadcn/ui
- React Router DOM

---

## Project Setup (Local)

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Steps to Run Locally

```bash
# Install dependencies
npm install

### Start Frontend
cd sports-club-hub-main
npm run dev

### Start Backend
cd sports-club-hub-main/server
npm start

Frontend runs on http://localhost:8080  
Backend runs on http://localhost:5000

#The frontend communicates with the backend using REST APIs over HTTP.

# Clone the repository
git clone <your-repository-link>

# Navigate to project folder
cd sports-club-hub-main

# Install frontend dependencies
npm install

# Start frontend server
npm run dev

# Navigate to backend folder
cd server

# Install backend dependencies
npm install

# Start backend server
npm start

Frontend (React + Vite)
        |
        | REST API (Axios)
        |
Backend (Node.js + Express)
        |
        |
Database (MySQL)

---

## Detailed Project Objectives

- Manage sports club members and memberships  
- Allow users to browse and book events  
- Provide secure authentication and authorization  
- Enable admins to manage events and event slots  
- Allow admins to enable/disable event slots dynamically  
- Build a clean, responsive, and scalable system  
- Implement real-world backend integration using REST APIs  

---

## Core Features

### User Features

- User registration and login  
- View available events  
- View event slots with time, seats, and availability  
- Book available event slots  
- View personal bookings  
- Manage user profile  
- Online membership payment integration  

---

### Admin Features

- Secure admin login  
- Admin dashboard with statistics  
- View total members and active bookings  
- View and manage all events  
- Create new events  
- Manage event slots:
  - View slots per event  
  - Enable or disable slots  
  - View bookings for specific events  
- Manage users (view, block, and disable users)  
- Upload facility and event images  

---

## Project Folder Structure

