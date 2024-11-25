import cron from "node-cron";
import { saveFixtures } from "../controllers/dataController.js";  // Correct path to dataController.js

console.log('Starting cron job file...');  // Check if file is loaded

// Schedule the cron job to run every 10 seconds (for testing, you can change this later)
cron.schedule("0 0 0 * * *", async () => { // Runs at 00:00:00 every day
    try {
        console.log('Cron job running to update fixtures...');
        // Call the saveFixtures function
        await saveFixtures();
        console.log('Fixtures updated successfully!');
    } catch (error) {
        console.error('Error running cron job:', error.message);
    }
});
