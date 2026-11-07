# Habit-Tracker

A simple web-based Daily Habit Tracker built using **HTML, CSS, JavaScript, Google Apps Script, and Google Sheets**.

Track your daily habits with a calendar, mark tasks as completed, and save your progress automatically to Google Sheets.

## Features

- Monthly calendar with Previous and Next navigation.
- Select any date to open its checklist.
- 20 predefined daily habits.
- Individual completion status for each date.
- Automatic saving to Google Sheets.
- Daily progress indicator.
- Previously completed tasks remain checked when you revisit a date.

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Google Apps Script
- Google Sheets

## Project Structure

```text
Daily-Habit-Tracker/
│
├── calender.html
├── checklist.html
├── Code.gs
└── README.md
```

## Google Sheets Database Setup

### 1. Create a Google Spreadsheet

1. Open [Google Sheets](https://sheets.google.com).
2. Create a new spreadsheet.
3. Name it `Daily Habit Tracker DB`.
4. Copy the Spreadsheet ID from its URL.

Example:

```text
https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
```

### 2. Configure Google Apps Script

1. Open [Google Apps Script](https://script.google.com).
2. Create a new project.
3. Open the `Code.gs` file.
4. Paste the `Code.gs` code from this repository.
5. Replace the Spreadsheet ID in the code:

```javascript
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID";
```

**Important:** Paste only the Spreadsheet ID, not the entire Google Sheets URL.

6. Save the project.

### 3. Initialize the Database

1. Select `setupDatabase` from the function dropdown.
2. Click **Run**.
3. Allow the requested Google permissions.
4. Wait for the execution to finish successfully.

The script automatically creates two sheets:

| Sheet | Purpose |
|---|---|
| Tasks | Stores the 20 daily habits |
| DailyLogs | Stores daily task completion records |

### 4. Deploy Google Apps Script as a Web App

1. Click **Deploy → New deployment**.
2. Select **Web app**.
3. Set **Execute as** to `Me`.
4. Set **Who has access** to `Anyone` for the prototype.
5. Click **Deploy**.
6. Complete authorization if requested.
7. Copy the Web App URL ending in `/exec`.

### 5. Connect the HTML Files to the API

Open both `calender.html` and `checklist.html`.

At the top of each file, find:

```javascript
const API_URL = "PASTE_YOUR_WEB_APP_URL_HERE";
```

Replace it with your deployed Web App URL:

```javascript
const API_URL = "YOUR_DEPLOYED_WEB_APP_URL";
```

Use the same URL in both HTML files.

### 6. Run the Project

1. Keep `calender.html` and `checklist.html` in the same folder.
2. Open `calender.html` in your browser.
3. Select a date.
4. Mark your daily habits as completed.
5. Your progress will automatically save to Google Sheets.

## API Actions

The Google Apps Script Web App supports these actions:

| Action | Description |
|---|---|
| `getTasks` | Retrieves all daily habits |
| `getDailyChecklist` | Retrieves tasks and completion status for a selected date |
| `saveTaskStatus` | Saves or updates a task's completion status |

Example API request:

```text
YOUR_WEB_APP_URL?action=getTasks
```

## Important Notes

- Each date has its own checklist progress.
- Google Sheets stores the completion records.
- If you update `Code.gs`, deploy a new version using **Deploy → Manage deployments → Edit → New version → Deploy**.
- The current version is a single-user prototype. Public Web App access should not be used for sensitive or multi-user personal data without proper authentication and access controls.

## Future Improvements

- User registration and login.
- Admin-controlled registration permissions.
- Multiple user support.
- Habit statistics and analytics.
- Weekly and monthly progress reports.
- Dark mode.

## License

This project is open-source. You may use, modify, and improve it for learning and personal projects.
