/**
 * Cookie Authentication Utility
 * Manages student and admin cookies
 */

export const setCookie = (name, value, options = {}) => {
  const { path = '/', maxAge = null } = options;
  let cookieString = `${name}=${encodeURIComponent(value)}`;
  
  if (maxAge) {
    cookieString += `; max-age=${maxAge}`;
  }
  
  cookieString += `; path=${path}`;
  document.cookie = cookieString;
};

export const getCookie = (name) => {
  if (!document.cookie) return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop().split(';').shift());
  }
  
  return null;
};

export const getAllCookies = () => {
  const cookies = {};
  if (!document.cookie) return cookies;
  
  document.cookie.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name) {
      cookies[name] = decodeURIComponent(value || '');
    }
  });
  
  return cookies;
};

export const deleteCookie = (name) => {
  document.cookie = `${name}=; max-age=0; path=/`;
};

export const deleteAllCookies = () => {
  document.cookie.split(';').forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    if (name) {
      deleteCookie(name);
    }
  });
};

export const isStudentAuthenticated = () => {
  const studentName = getCookie('studentName');
  const studentSID = getCookie('studentSID');
  return !!(studentName && studentSID);
};

export const isAdminAuthenticated = () => {
  const adminToken = getCookie('adminToken');
  return !!adminToken;
};
