// src/services/FormularioComponentesServices.jsx

export const obtenerTecnicos = async () => {
  const response = await fetch("http://172.20.70.113:3000/api/tecnicos");
  if (!response.ok) throw new Error("Error al obtener técnicos");
  return await response.json();
};

export const obtenerUsuarios = async () => {
  const response = await fetch("http://172.20.70.113:3000/api/usuarios");
  if (!response.ok) throw new Error("Error al obtener usuarios");
  return await response.json();
};

export const obtenerEquipos = async () => {
  const response = await fetch("http://172.20.70.113:3000/api/equipos");
  if (!response.ok) throw new Error("Error al obtener equipos");
  return await response.json();
};
export const obtenerUsuarioPorNombre = async (nombre) => {
  const response = await fetch(
    `http://172.20.70.113:3000/api/usuarios/detalle?nombre=${encodeURIComponent(
      nombre
    )}`
  );

  if (!response.ok) 
    throw new Error(`Error al obtener usuario por nombre: ${response.status}`);
    return await response.json();


  /* const text = await response.text();
  if (!text) {
    throw new Error("Respuesta vacía del servidor al obtener usuario");
  } */

  /* return JSON.parse(text); */
};

export const obtenerEquipoPorNombre = async (nombre) => {
  const response = await fetch(
    `http://172.20.70.113:3000/api/equipos/detalle?nombre=${encodeURIComponent(
      nombre
    )}`
  );
  if (!response.ok) throw new Error("Error al obtener equipo por nombre");
  return await response.json();
};
