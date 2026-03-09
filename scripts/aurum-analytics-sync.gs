const AURUM_BASE_URL = 'https://aurumdiary.com';
const ANALYTICS_SECRET = 'REPLACE_WITH_ANALYTICS_EXPORT_SECRET';

const EXPORTS = [
  {
    sheetName: 'Email Funnel',
    url: `${AURUM_BASE_URL}/api/admin/analytics/email-funnel?format=csv`,
  },
  {
    sheetName: 'Reminder Funnel',
    url: `${AURUM_BASE_URL}/api/admin/analytics/reminder-funnel?format=csv`,
  },
  {
    sheetName: 'Revenue Summary',
    url: `${AURUM_BASE_URL}/api/admin/analytics/revenue-summary?format=csv`,
  },
];

function refreshAurumAnalytics() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  EXPORTS.forEach((config) => {
    const response = UrlFetchApp.fetch(config.url, {
      method: 'get',
      muteHttpExceptions: true,
      headers: {
        'x-analytics-export-secret': ANALYTICS_SECRET,
      },
    });

    const status = response.getResponseCode();
    if (status !== 200) {
      throw new Error(`Export failed for ${config.sheetName}: HTTP ${status}\n${response.getContentText()}`);
    }

    const csv = response.getContentText();
    const rows = Utilities.parseCsv(csv);
    const sheet = ensureSheet(spreadsheet, config.sheetName);
    sheet.clearContents();

    if (rows.length > 0) {
      sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);
      sheet.setFrozenRows(1);
      autoResize(sheet, rows[0].length);
    }
  });

  ensureWeeklyNotesSheet(spreadsheet);
}

function ensureSheet(spreadsheet, sheetName) {
  return spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
}

function ensureWeeklyNotesSheet(spreadsheet) {
  const sheet = ensureSheet(spreadsheet, 'Weekly Notes');
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 6).setValues([[
      'week',
      'best_email',
      'best_reminder_tone',
      'main_drop_off',
      'decision',
      'notes',
    ]]);
    sheet.setFrozenRows(1);
  }
}

function autoResize(sheet, columnCount) {
  for (let column = 1; column <= columnCount; column += 1) {
    sheet.autoResizeColumn(column);
  }
}

function createDailyTrigger() {
  ScriptApp.newTrigger('refreshAurumAnalytics')
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .create();
}
