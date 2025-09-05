export const timeAgo = (date: any): string => {
  // Handle undefined, null, or invalid dates
  if (!date) return 'unknown';
  
  // Convert to Date object if it's not already
  let dateObj: Date;
  
  if (date instanceof Date) {
    dateObj = date;
  } else if (date && typeof date === 'object' && date.toDate) {
    // Firebase Firestore Timestamp
    dateObj = date.toDate();
  } else if (date && typeof date === 'object' && date.seconds) {
    // Firebase Firestore Timestamp object with seconds
    dateObj = new Date(date.seconds * 1000);
  } else if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
  } else {
    console.log('Invalid date format:', date, typeof date);
    return 'unknown';
  }
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    console.log('Invalid date object:', dateObj, 'from:', date);
    return 'unknown';
  }
  
  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
};