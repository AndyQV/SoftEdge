import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField } from "@mui/material";
import "../css/Generate.css"; // Importa el archivo CSS para estilos personalizados

function Generate() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [copiarText, setCopiarText] = useState("Copiar"); // Estado para controlar el texto copiado
  const [pegarText, setPegarText] = useState("Pegar"); // Estado para controlar el texto pegado
  const [selectedOption, setSelectedOption] = useState("MAX"); // Estado para controlar la opción seleccionada
  const [limit, setLimit] = useState(1); // Estado para controlar el límite
  const [history, setHistory] = useState(["1", "2", "3", "4"]); // Estado para controlar el historial
  const [loading, setLoading] = useState(false); // Estado para controlar el estado de carga

  const promptRules = `Please create a JSON object with the following structure: 
{
  "projectName": "The name of the project",
  "description": "A brief description of the project",
  "epics": [
    { "title": "Epic title", "data": "Epic description" }
  ],
  "functionalRequirements": [
    { "title": "Requirement title", "data": "Requirement description" }
  ],
  "nonFunctionalRequirements": [
    { "title": "Requirement title", "data": "Requirement description" }
  ],
  "userStories": [
    { "title": "User story title", "data": "User story description" }
  ]
}
The number of elements in each list should be ${selectedOption} ${limit}, respecting any constraints given by MAX or MIN values. Do not include additional text inside or outside the JSON. Do not make up data that has not been asked.`;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (prompt.trim() === "") {
      alert("Por favor, ingresa un prompt apropiado.");
      return;
    }

    setLoading(true); // Cambiar el estado de carga a verdadero

    try {
      addToHistory(prompt); // Agregar el prompt al historial

      const structuredPrompt = promptRules + prompt;

      alert("Solicitud recibida, generando texto... " + structuredPrompt); // Aquí se muestra el mensaje de que se recibió la solicitud
      const result = await fetch("http://localhost:5001/generateEpic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: structuredPrompt }),
      });
      const response = await result.json();
      const generatedText = response.data;
      // navigate("/home", { state: { generatedText } }); // Regresar el texto generado a la página de inicio
      alert(generatedText); // Aquí se muestra el mensaje de que se generó el texto
    } catch (error) {
      // En caso de error
      console.error("Error:", error);
      alert("Error al generar el texto. Por favor, inténtalo de nuevo."); // Aquí se muestra el mensaje de error
    } finally {
      // Cambiar el estado de carga a falso
      setLoading(false);
    }
  };

  const handleErase = () => {
    setPrompt(""); // Limpiar el campo de entrada
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setCopiarText("¡Texto copiado!"); // Cambiar el texto del botón a "Texto copiado!"
    setPegarText("Pegar"); // Cambiar el texto del botón a "Pegar"

    setTimeout(() => {
      setCopiarText("Copiar"); // Cambiar el texto del botón a "Copiar" después de 2 segundos
    }, 2000);
  };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setPrompt(prompt + text); // Actualizar el estado del prompt sumando el texto pegado
    setPegarText("¡Texto pegado!"); // Cambiar el texto del botón a "Texto pegado!"
    setCopiarText("Copiar"); // Cambiar el texto del botón a "Copiar"

    setTimeout(() => {
      setPegarText("Pegar"); // Cambiar el texto del botón a "Pegar" después de 2 segundos
    }, 2000);
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option); // Actualizar el estado de la opción seleccionada
  };

  const addToHistory = (prompt) => {
    setHistory((prevHistory) => {
      const newHistory = [prompt, ...prevHistory]; // Agregar el nuevo prompt al historial
      return newHistory.slice(0, 4);
    });
  };

  const handleHistorialClick = (item) => {
    setPrompt(item); // Actualizar el prompt con el elemento del historial seleccionado
  };

  return (
    <div style={{ width: 1400 }}>
      <form style={{ width: 1400 }} onSubmit={onSubmit}>
        <Box // Cuerpo de pagina
          margin={"auto"}
          width={1400}
          flexDirection={"row"}
          justifyContent={"space-between"}
          display={"flex"}
          marginTop={10}
        >
          <div style={{ width: "48%" }}>
            <Box className="pink-box">
              {/* Caja de prompt */}
              <span className="prompt-text">
                <p>Prompt:</p>
                <span className="button-container" id="button-container-right">
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={handleCopy} // Copia el texto del prompt
                  >
                    {copiarText}
                  </button>
                  <button
                    className="secondary-button"
                    type="button"
                    onClick={handlePaste} // Pega el texto del portapapeles en el prompt
                  >
                    {pegarText}
                  </button>
                </span>
              </span>
              <TextField
                className={"login-input"}
                name={"prompt"}
                id={"prompt"}
                variant={"outlined"}
                margin={"normal"}
                multiline={true}
                rows={16}
                autoComplete="off"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)} // Actualiza el estado del prompt
                // Se utiliza para modificar el estilo de los elementos internos del TextField de mui materials:
                slotProps={{
                  // inputLabel: {
                  //   // Label del TextField
                  //   sx: {
                  //     color: "#000000",
                  //   },
                  // },
                  htmlInput: {
                    // Texto del TextField
                    sx: {
                      color: "#000000",
                    },
                  },
                  input: {
                    // Input del Fondo
                    sx: {
                      backgroundColor: "#FFFFFF",
                    },
                  },
                }}
              />
            </Box>
            <span className="button-container">
              {/* Botones de generar y eliminar */}
              <button className="main-button" type="submit" disabled={loading}>
                {loading ? "Cargando..." : "Generar"}{" "}
                {/* Cambia el texto del botón según el estado de carga */}
              </button>
              <button
                className="main-button"
                type="button"
                onClick={handleErase}
              >
                Eliminar
              </button>
            </span>
          </div>
          <Box className="pink-box">
            <span className="prompt-options-text">
              <p id="prompt-options">Opciones:</p>
            </span>

            <span className="prompt-options-container">
              <p>Nivel de detalle:</p>
              <select className="select-options">
                <option value="1">Bajo</option>
                <option value="2">Medio</option>
                <option value="3">Alto</option>
              </select>
            </span>

            <span className="prompt-options-container">
              <p>Límite de lista:</p>
              <button
                className="secondary-button"
                id="prompt-options-button"
                type="button"
                style={{
                  // Aplicar estilos condicionales
                  textDecoration:
                    selectedOption === "MAX" ? "underline" : "none",
                }}
                onClick={() => handleOptionSelect("MAX")} // Cambia el estado de la opción seleccionada a "MAX"
              >
                MAX
              </button>
              <button
                className="secondary-button"
                id="prompt-options-button"
                type="button"
                style={{
                  textDecoration:
                    selectedOption === "MIN" ? "underline" : "none",
                }}
                onClick={() => handleOptionSelect("MIN")} // Cambia el estado de la opción seleccionada a "MIN"
              >
                MIN
              </button>
              <input
                className="input-options"
                type="number"
                min="1"
                max="25"
                value={limit}
                onChange={(e) => setLimit(e.target.value)} // Actualiza el estado del límite
                placeholder="0"
              />
            </span>

            <span className="prompt-options-text" style={{ marginTop: "10px" }}>
              <p id="prompt-options">Historial:</p>
            </span>
            <div className="history-container">
              {history.map(
                (
                  item,
                  index // Mapeamos el historial
                ) => (
                  <div
                    title={item} // Usamos el 'item' como título para el elemento
                    key={index} // Usamos el 'indiex' como clave única
                    className="history-item"
                    onClick={() => handleHistorialClick(item)} // Manejador de clics para el historial
                  >
                    <span>
                      {item || ""} {/* Manejar el caso de vacío */}
                    </span>
                  </div>
                )
              )}
            </div>
            <button
              className="secondary-button"
              id="prompt-options-button"
              type="button"
              onClick={() => setHistory([])} // Limpiar el historial
            >
              Limpiar
            </button>
          </Box>
        </Box>
      </form>
      {/* Pantalla de carga */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Generando texto, por favor espere...</p>
        </div>
      )}
    </div>
  );
}

export default Generate;
