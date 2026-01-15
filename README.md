# Firebase Studio

🏫 CampusFind

CampusFind is a campus-exclusive Lost & Found web application that helps students securely report and recover lost items. To ensure trust and prevent misuse, only verified college students can access the platform. User identity is validated through college ID verification, managed by admins with optional AI assistance.

Installation 

Prerequisites:
Node.js (v18 or above)
Firebase account
Firebase CLI installed
Git

Steps:
1. Clone the repository
git clone https://github.com/your-username/CampusFind.git

2. Navigate to the project directory:
cd CampusFind

3. Install dependencies:
npm install

4. Set up Firebase:
Create a Firebase project
Enable Firebase Authentication
Enable Firestore Database
Configure Firebase App Hosting
Add Firebase environment variables
Deploy Firestore security rules from firestore.rules

5. Run the development server:
npm run dev

Usage:
User Flow
1. User signs up using Full Name and USN
2. Uploads a college ID image
3. Account is created with verificationStatus: pending
4. User waits for admin approval
5.After approval, user logs in and accesses the main feed

Admin Flow
1. Admin logs in to the dashboard
2. Views pending verification requests
3. Reviews user details and ID image
4. Approves or rejects the user

Main App Features
1. View lost and found posts
2. Create new posts
3. Reply to posts
4. Delete own posts
5. Edit profile details
6. View notifications

Technologies Used
The following technologies are accurately used in this project, grouped by their role:

Frontend & Framework
Next.js – Core framework built on React, handling routing and performance
React – UI library used to build all components
TypeScript – Adds type safety and improves maintainability

Styling & UI
Tailwind CSS – Utility-first CSS framework for styling
ShadCN UI – Prebuilt, customizable UI components built on Tailwind
Lucide React – Icon library used across the application

Backend & Cloud Services
Firebase
Firebase Authentication – Manages user sign-up and login
Firebase Firestore – NoSQL database for users, posts, replies, and notifications
Firebase App Hosting – Hosts the Next.js application

AI & Verification
Genkit – Open-source framework for managing AI workflows
Google Gemini Models – LLMs used for AI-assisted college ID verification
