/**
 * Student Login Tracker
 * Manages student login records in localStorage with timestamps
 */

const STORAGE_KEY = 'studentLogins';

export const recordStudentLogin = (name, sid) => {
  const logins = getStudentLogins();
  
  const newLogin = {
    name,
    sid,
    loginTime: new Date().toISOString(),
  };
  
  logins.push(newLogin);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logins));
  
  return newLogin;
};

export const getStudentLogins = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  
  if (!data) {
    return [];
  }
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error parsing student logins:', error);
    return [];
  }
};

export const updateStudentLogin = (index, name, sid) => {
  const logins = getStudentLogins();
  
  if (index < 0 || index >= logins.length) {
    console.error('Invalid index');
    return false;
  }
  
  logins[index].name = name;
  logins[index].sid = sid;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logins));
  return true;
};

export const deleteStudentLogin = (index) => {
  const logins = getStudentLogins();
  
  if (index < 0 || index >= logins.length) {
    console.error('Invalid index');
    return false;
  }
  
  logins.splice(index, 1);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logins));
  return true;
};

export const clearAllStudentLogins = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const formatLoginTime = (isoString) => {
  const date = new Date(isoString);
  
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};
