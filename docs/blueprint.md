# **App Name**: CampusFind

## Core Features:

- Admin Signup with Key: Secure admin signup using a hardcoded key '298761'.
- User Signup: Collect user details (full name, USN, ID card image) for verification.
- ID Verification: Admin tool to approve/reject users based on uploaded ID card image, full name and USN validation, storing ID card images securely in Firebase Storage and optionally deleting after verification. Includes display of uploaded ID cards for verification. Incorporates an LLM tool to assist the admin in confirming the ID and associated info.
- Unified Lost & Found Feed: Display lost and found posts in a single feed, differentiated by tags.
- Auto-expiring Posts: Posts expire automatically after 30 days, including associated replies, chats and notifications.
- Controlled Replies: Limit replies per post to 5, locking the reply section thereafter.
- Private Messaging: Enable private messaging only between the post owner and replier.
- Notifications: Notify users of new replies, messages and account approval/rejection status.

## Style Guidelines:

- Primary color: Deep blue (#2962FF) to convey trust and security, anchoring on the idea of institutional credibility while avoiding a stuffy or old fashioned vibe.
- Background color: Very light blue (#E5EDFF), subtly desaturated to complement the primary blue.
- Accent color: Violet (#7F5AF0), provides contrast, sitting to the 'left' of blue on the color wheel.
- Body and headline font: 'Inter', a sans-serif font offering a modern, machined, objective look for both headlines and body text.
- Use clear, minimalist icons for navigation and post categories.
- Intuitive bottom navigation for Feed, Messages, Notifications and Admin (conditional).
- Subtle transitions and feedback animations for interactions like posting and replying.