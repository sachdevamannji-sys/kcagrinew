// Indian Standard Time (IST) utilities

// Convert a date string to IST datetime
export function toISTDateTime(dateString: string): Date {
  const date = new Date(dateString);
  // IST is UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const utcTime = date.getTime();
  return new Date(utcTime + istOffset - (date.getTimezoneOffset() * 60 * 1000));
}

// Get today's date in IST as YYYY-MM-DD format
export function getTodayIST(): string {
  const now = new Date();
  const istTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const day = String(istTime.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format date for input field (YYYY-MM-DD) in IST
export function formatDateForInput(date: string | Date): string {
  const d = new Date(date);
  const istDate = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Format date for display in IST
export function formatDateTimeIST(dateString: string): string {
  return new Date(dateString).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format date only (no time) in IST
export function formatDateIST(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Convert YYYY-MM-DD to IST timestamp for storage
export function dateStringToISTTimestamp(dateString: string): string {
  // Parse the date string as IST
  const [year, month, day] = dateString.split('-').map(Number);
  const istDate = new Date(year, month - 1, day, 12, 0, 0); // Set to noon IST to avoid edge cases
  return istDate.toISOString();
}
