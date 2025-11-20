import React, { useState, useEffect } from "react";
import { generarPDFenMemoria } from "../helpers/pdfUtilsActivos";
import EditorComentario from "../EditorComentario/EditorComentario";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "../themes";

import { useParams } from "react-router-dom";
import { usePrefersDarkMode } from "../../hooks/usePrefersDarkMode";
import {
  PaginaCompleta,
  FormularioContenedor,
  TituloFormulario,
  SeccionFormulario,
  FilaFormulario,
  BotonContainer,
} from "../Formulario/FormularioStyles";

const EditarInformeTecnico = () => {
  const isDarkMode = usePrefersDarkMode();
  const [firmaBase64, setFirmaBase64] = useState(null);
  const [formData, setFormData] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchInforme = async () => {
      try {
        const response = await axios.get(
          `http://172.20.70.113:3000/api/informes/${id}`
        );
        setFormData(response.data);
      } catch (error) {
        console.error("Error al obtener el informe:", error);
      }
    };
    fetchInforme();
  }, [id]);
  /*   const [formData, setFormData] = useState({
    requerimiento: informe.requerimiento || "",
    comentario: informe.COMENTARIO || "",
    tecnico: informe.nombreTecnico || "",
    usuario: informe.nombreUsuario || "",
    email: informe.email || "",
    cargo: informe.cargo || "",
    empresa: informe.empresa || "",
    departamento: informe.departamento || "",
    equipo: informe.equipo || "",
    modelo: informe.modelo || "",
    marca: informe.marca || "",
    agencia: informe.agencia || "",
    ipEquipo: informe.ipEquipo || "",
    numSerie: informe.numSerie || "",
    direccionMAC: informe.direccionMAC || "",
    codigoBarras: informe.codigoBarras || "",
    discoDuro: informe.discoDuro || "",
    espacioLibre: informe.espacioLibre || "",
    memoriaRAM: informe.memoriaRAM || "",
    procesador: informe.procesador || "",
    velocidad: informe.velocidad || "",
    sistemaOperativo: informe.sistemaOperativo || "",
    version_so: informe.version_so || "",
    firma: firmaBase64,
    imagenes: informe.imagenes || [],
  });
 */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardarCambios = async () => {
    if (!formData.requerimiento || !formData.comentario) {
      toast.warning("Todos los campos son obligatorios.");
      return;
    }

    try {
      const resultado = await generarPDFenMemoria(formData);
      if (!resultado.success) {
        toast.error("Error al generar el PDF.");
        return;
      }

      const pdfBlob = resultado.blob;
      const reader = new FileReader();
      reader.onloadend = async () => {
        const pdfBase64 = reader.result.split(",")[1];
        await fetch(
          `http://172.20.70.113:3000/api/pdf/actualizar/${informe.ID}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...formData, pdf: pdfBase64 }),
          }
        );
        toast.success("✅ Informe actualizado correctamente.");
        onUpdate();
      };
      reader.readAsDataURL(pdfBlob);
    } catch (error) {
      console.error("Error al actualizar informe:", error);
      toast.error("❌ No se pudo actualizar el informe.");
    }
  };

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <PaginaCompleta>
        <FormularioContenedor>
          <TituloFormulario>Editar Informe Técnico Rechazado</TituloFormulario>
          <SeccionFormulario>
            <FilaFormulario>
              <div>
                <label htmlFor="requerimiento">Requerimiento</label>
                <input
                  type="text"
                  id="requerimiento"
                  name="requerimiento"
                  value={formData.requerimiento}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="tecnico">Técnico</label>
                <input
                  type="text"
                  id="tecnico"
                  name="tecnico"
                  value={formData.tecnico}
                  onChange={handleChange}
                  readOnly
                />
              </div>
            </FilaFormulario>
          </SeccionFormulario>

          <SeccionFormulario>
            <h3>Comentario</h3>
            <EditorComentario
              value={formData.comentario}
              onChange={(html) =>
                setFormData((prev) => ({ ...prev, comentario: html }))
              }
            />
          </SeccionFormulario>

          <BotonContainer>
            <button className="btn-azul" onClick={handleGuardarCambios}>
              Guardar Cambios
            </button>
            <button className="btn-rojo" onClick={onClose}>
              Cancelar
            </button>
          </BotonContainer>
        </FormularioContenedor>
        <ToastContainer position="top-right" autoClose={3000} />
      </PaginaCompleta>
    </ThemeProvider>
  );
};

export default EditarInformeTecnico;
