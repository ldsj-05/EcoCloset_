Get started
1. Prerequisites
Before you begin, make sure you have the following installed:

Node.js 

npm or yarn

Git installed and configured on your machine

2. Installation & Setup
To get a local copy of the project up and running, follow these steps:

Clone the repository:

Bash
git clone https://github.com/nias-antics/DigitalWardobe.git
cd DigitalWardobe
Install dependencies:

Bash
npm install
3. Running the App
Run the following command to start the Metro bundler:

Bash
npx expo start
In the output, you'll find options to open the app in a:

Development build

Android emulator

iOS simulator

Expo Go, a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the app directory. This project uses file-based routing.

🛠 GitHub Workflow & Development
Branching
Always ensure you are working on the correct feature branch. To switch to the latest development branch:

Bash
git fetch origin
git checkout purchase-final-v2
Pushing Changes
When you have finished your updates, follow the standard Git cycle to push them to GitHub:

Stage your changes:

Bash
git add .
Commit your work:

Bash
git commit -m "Brief description of your changes"
Push to the branch:

Bash
git push origin purchase-final-v2
🔄 Get a fresh project
When you're ready to start from scratch, run:

Bash
npm run reset-project
This command will move the starter code to the app-example directory and create a blank app directory where you can start developing.

📚 Learn more
To learn more about developing your project with Expo, look at the following resources:

Expo documentation: Learn fundamentals, or go into advanced topics with our guides.

Learn Expo tutorial: Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

👥 Join the community
Join our community of developers creating universal apps:

Expo on GitHub: View our open source platform and contribute.

Discord community: Chat with Expo users and ask questions.
