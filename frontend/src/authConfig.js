// src/authConfig.js
export const msalConfig = {
  auth: {
    clientId: "e0582bd1-a7b0-498e-a476-f6a24ad817a1", // ID de la aplicación registrada en Azure AD
    authority: "https://login.microsoftonline.com/5403bb85-6bc3-495d-8a5e-1a61c622dd74", // ID del tenant
    redirectUri: "http://localhost:3000", // Debe coincidir con el URI registrado en Azure
  },
  cache: {
    cacheLocation: "localStorage", // o "sessionStorage"
    storeAuthStateInCookie: false,
  },
};


export const loginRequest = {
  scopes: ["User.Read"], // Puedes agregar más scopes si tu app los necesita
};
