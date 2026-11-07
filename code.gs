
const SPREADSHEET_ID = "1AgKDV0OQBIDcOslZHbVP3Z668P9M7g3rYHZRZu_MoP8";

const TASKS = [
  ["Wake up"],
  ["Face wash"],
  ["Drink 2 glasses of water"],
  ["Brush teeth (2 minutes)"],
  ["10 Jumping Jacks"],
  ["10 Squats"],
  ["10 Push-ups"],
  ["1-minute Plank"],
  ["Daily Bath"],
  ["English Learning (1 Hour)"],
  ["Eat Breakfast"],
  ["Drink 1 glass of water"],
  ["Eat Lunch"],
  ["Drink 1 glass of water"],
  ["Drink 2 glasses of water"],
  ["Eat Dinner"],
  ["Drink 1 glass of water"],
  ["Brush teeth (2 minutes)"],
  ["Turn off Instagram, YouTube and chats"],
  ["Sleep"]
];

const TASKS_SHEET = "Tasks";
const LOGS_SHEET = "DailyLogs";

// Run this function once manually from Apps Script.
function setupDatabase() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  let tasksSheet = ss.getSheetByName(TASKS_SHEET);
  if (!tasksSheet) tasksSheet = ss.insertSheet(TASKS_SHEET);

  let logsSheet = ss.getSheetByName(LOGS_SHEET);
  if (!logsSheet) logsSheet = ss.insertSheet(LOGS_SHEET);

  if (tasksSheet.getLastRow() === 0) {
    const taskRows = [["Task ID", "Task Name"]];

    TASKS.forEach((task, index) => {
      taskRows.push([index + 1, task[0]]);
    });

    tasksSheet.getRange(1, 1, taskRows.length, 2).setValues(taskRows);
    tasksSheet.setFrozenRows(1);
  }

  if (logsSheet.getLastRow() === 0) {
    logsSheet.getRange(1, 1, 1, 4).setValues([
      ["Date", "Task ID", "Completed", "Updated At"]
    ]);

    logsSheet.setFrozenRows(1);
    logsSheet.getRange("A:A").setNumberFormat("@");
  }

  return "Database setup completed.";
}

function getTasks() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(TASKS_SHEET);

  if (!sheet || sheet.getLastRow() < 2) {
    throw new Error("Tasks sheet is empty. Run setupDatabase() first.");
  }

  return sheet.getRange(2, 1, sheet.getLastRow() - 1, 2)
    .getValues()
    .map(row => ({
      id: Number(row[0]),
      name: String(row[1])
    }));
}

function validateDate(date) {
  const value = String(date || "");

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Date must be in YYYY-MM-DD format.");
  }

  const parts = value.split("-").map(Number);
  const check = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));

  if (
    check.getUTCFullYear() !== parts[0] ||
    check.getUTCMonth() !== parts[1] - 1 ||
    check.getUTCDate() !== parts[2]
  ) {
    throw new Error("Invalid calendar date.");
  }

  return value;
}

function normalizeSheetDate(value, timezone) {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, timezone, "yyyy-MM-dd");
  }

  return String(value || "").trim().substring(0, 10);
}

function getDailyChecklist(date) {
  date = validateDate(date);

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const timezone = ss.getSpreadsheetTimeZone();
  const logsSheet = ss.getSheetByName(LOGS_SHEET);

  if (!logsSheet) {
    throw new Error("DailyLogs sheet not found. Run setupDatabase() first.");
  }

  const tasks = getTasks();
  const completedMap = {};

  if (logsSheet.getLastRow() >= 2) {
    const rows = logsSheet.getRange(
      2, 1, logsSheet.getLastRow() - 1, 4
    ).getValues();

    rows.forEach(row => {
      const savedDate = normalizeSheetDate(row[0], timezone);
      const taskId = Number(row[1]);

      if (savedDate === date && taskId) {
        completedMap[taskId] =
          row[2] === true || String(row[2]).toLowerCase() === "true";
      }
    });
  }

  return tasks.map(task => ({
    id: task.id,
    name: task.name,
    completed: completedMap[task.id] === true
  }));
}

function saveTaskStatus(date, taskId, completed) {
  date = validateDate(date);

  taskId = Number(taskId);

  if (!Number.isInteger(taskId) ||
      taskId < 1 ||
      taskId > TASKS.length) {
    throw new Error("Invalid task ID.");
  }

  if (completed !== true && completed !== false) {
    throw new Error("Completed must be true or false.");
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(LOGS_SHEET);

    if (!sheet) {
      throw new Error("DailyLogs sheet not found.");
    }

    const timezone = ss.getSpreadsheetTimeZone();
    const lastRow = sheet.getLastRow();

    if (lastRow >= 2) {
      const rows = sheet.getRange(2, 1, lastRow - 1, 4).getValues();

      for (let i = 0; i < rows.length; i++) {
        const savedDate = normalizeSheetDate(rows[i][0], timezone);
        const savedTaskId = Number(rows[i][1]);

        if (savedDate === date && savedTaskId === taskId) {
          const rowNumber = i + 2;

          sheet.getRange(rowNumber, 3).setValue(completed);
          sheet.getRange(rowNumber, 4).setValue(new Date());

          return {
            success: true,
            message: "Updated successfully."
          };
        }
      }
    }

    const newRow = sheet.getLastRow() + 1;

    sheet.getRange(newRow, 1).setNumberFormat("@");
    sheet.getRange(newRow, 1, 1, 4).setValues([[
      date,
      taskId,
      completed,
      new Date()
    ]]);

    return {
      success: true,
      message: "Saved successfully."
    };

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  let result;

  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const action = params.action;

    if (action === "getTasks") {
      result = getTasks();

    } else if (action === "getDailyChecklist") {
      result = getDailyChecklist(params.date);

    } else if (action === "saveTaskStatus") {
      result = saveTaskStatus(
        params.date,
        params.taskId,
        String(params.completed).toLowerCase() === "true"
      );

    } else {
      throw new Error("Unknown action.");
    }

  } catch (error) {
    result = { error: error.message };
  }

  const output = JSON.stringify(result);
  const callback = e && e.parameter ? e.parameter.callback : "";

  if (callback && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(callback)) {
    return ContentService
      .createTextOutput(callback + "(" + output + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(output)
    .setMimeType(ContentService.MimeType.JSON);
}
