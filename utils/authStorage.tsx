let accessToken: string | null = null;
let refreshToken: string | null = null;

let accessExp: number | null = null;
let refreshExp: number | null = null;

let username: string | null = null;
let email: string | null = null;
let userId: string | null = null;
let tenantId: string | null = null;

/* ACCESS TOKEN */

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};

/* REFRESH TOKEN */

export const setRefreshToken = (token: string) => {
  refreshToken = token;
};

export const getRefreshToken = () => {
  return refreshToken;
};

/* ACCESS EXPIRY */

export const setAccessExp = (exp: number) => {
  accessExp = exp;
};

export const getAccessExp = () => {
  return accessExp;
};

/* REFRESH EXPIRY */

export const setRefreshExp = (exp: number) => {
  refreshExp = exp;
};

export const getRefreshExp = () => {
  return refreshExp;
};

/* USERNAME */

export const setUsername = (name: string) => {
  username = name;

  if (typeof window !== "undefined") {
    localStorage.setItem("username", name);
  }
};

export const getUsername = () => {
  if (username) return username;

  if (typeof window !== "undefined") {
    return localStorage.getItem("username");
  }

  return null;
};

export const setUserId = (id: string) => {
  userId = id;

  if (typeof window !== "undefined") {
    localStorage.setItem("userId", id);
  }
};

export const getUserId = () => {
  if (userId) return userId;

  if (typeof window !== "undefined") {
    return localStorage.getItem("userId");
  }

  return null;
};



/* EMAIL */

export const setEmail = (mail: string) => {
  email = mail;
};

export const getEmail = () => {
  return email;
};

/* LOGOUT */

export const logout = () => {
  accessToken = null;
  refreshToken = null;
  accessExp = null;
  refreshExp = null;
  username = null;
  email = null;
  userId = null;

  if (typeof window !== "undefined") {
    localStorage.removeItem("userId");
    localStorage.removeItem("tenantId");
  }
};