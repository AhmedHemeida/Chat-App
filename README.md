# Real-time Chat App


## Demo Video
[Watch the Demo Video](https://screenapp.io/app/#/shared/ODZ4vaNOTg)



## Tech Stack
- **Frontend:** Next.js, Tailwind CSS  
- **Backend:** Node.js, Express  
- **Real-time:** Socket.IO  
- **Database:** MongoDB  
- **Authentication:** JWT with HTTP-only cookies  
- **File Uploads:** Multer  

## Database Structure
- **User**: { username, email, password, avatar }
- **Message**: { sender, receiver, text, image (optional), conversationId , timestamps }
- **Conversation**: { participants: [User IDs] , lastMessage }

## Technical Approach
1. Users can register/login.
2. store JWT in HTTP-only cookies for security  
3. Conversations are stored with participants.
4. Messages support text + optional images.
5. Real-time updates using Socket.IO.
6. File uploads handled with Multer and stored in `/uploads`.


## Running the App

1- Install dependencies :
- npm install

2- Setup .env :
- MONGO_URI=your_mongodb_uri
- JWT_SECRET=your_jwt_secret
- PORT=3000
  
3- Start backend server :
- nodemon app

4- Start frontend (Next.js) app :
- npm run dev

5- Open in browser :
http://localhost:3001     
