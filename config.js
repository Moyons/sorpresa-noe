// ============================================================
//  PERSONALIZA AQUÍ EL REGALO (todo lo demás no hace falta tocarlo)
// ============================================================
window.REGALO = {
  para: "Noe",                 // quien recibe el regalo
  de: "Iván",                    // quien lo regala
  ciudad: "Madrid",
  mensajeIntro: "He pensado que te mereces una noche de las que no se olvidan. Pero la elección es toda tuya.",
  mensajeFinal: "Prepárate para emocionarte, cantar bajito y aplaudir muy fuerte. Te quiero.",
  // Número de WhatsApp de quien regala (con prefijo, sin +). Vacío = solo se podrá compartir/copiar.
  whatsapp: "",
  // Pistas del principio (no deben decir "musical" a las claras)
  pistas: [
    "Habrá luces, y no será una discoteca.",
    "Tendrás que sentarte en una butaca, pero no será en un cine.",
    "Se canta, se baila y a veces se llora un poquito.",
  ],
  // Opciones para adivinar qué es. Todas llevan a la tarjeta de rasca.
  adivina: [
    { texto: "✈️ Un viaje", resp: "Uf, lejos... pero vas bien de ilusión 😏" },
    { texto: "🍽️ Una cena", resp: "Comer se come, pero no es lo principal 😉" },
    { texto: "🎬 Una peli", resp: "Hay pantalla... ¡no! Hay algo mejor, en directo 👀" },
    { texto: "🎤 Un concierto", resp: "¡Calentita! 🔥 Te falta un poco de historia..." },
  ],
  personas: 2,                   // entradas incluidas

  // Fechas en las que se puede elegir (ambas incluidas) y días de la semana
  // permitidos (0 = domingo ... 6 = sábado)
  desde: "2026-11-01",
  hasta: "2027-03-31",
  diasSemana: [4, 5, 6, 0],
  excluir: ["2026-12-24", "2026-12-25", "2026-12-31", "2027-01-01"],

  // Sesiones según el día de la semana
  sesiones: {
    4: ["20:30"],
    5: ["20:30"],
    6: ["17:00", "21:00"],
    0: ["18:00"],
  },

  // Planes extra para completar la noche (la persona marca los que quiera)
  extras: [
    { id: "cena", emoji: "🍝", titulo: "Cena antes", texto: "Mesa reservada para ir con calma y con hambre." },
    { id: "copa", emoji: "🥂", titulo: "Copa después", texto: "Para comentar la función, entre brindis." },
    { id: "merch", emoji: "🎁", titulo: "Recuerdo", texto: "Te llevas algo del musical como recuerdo." },
  ],

  // Musicales entre los que elegir. Cambia, quita o añade los que quieras.
  musicales: [
    {
      id: "rey-leon",
      titulo: "El Rey León",
      lema: "El ciclo de la vida, en directo",
      texto: "Máscaras, marionetas y música africana que te pone la piel de gallina desde el primer “Nants ingonyama”.",
      glifo: "🦁",
      colores: ["#f6a21e", "#8a2a0c"],
      duracion: "2 h 40 min",
      ambiente: "Espectáculo visual",
    },
    {
      id: "mamma-mia",
      titulo: "Mamma Mia!",
      lema: "Canciones de ABBA para no parar de bailar",
      texto: "Una boda en una isla griega, una madre, tres posibles padres y todos los éxitos de ABBA.",
      glifo: "💃",
      colores: ["#ff4f9a", "#3a1a8c"],
      duracion: "2 h 20 min",
      ambiente: "Fiesta y risas",
    },
    {
      id: "miserables",
      titulo: "Los Miserables",
      lema: "¿Oyes cantar al pueblo?",
      texto: "El gran clásico: redención, amor y revolución con una banda sonora que te deja sin aliento.",
      glifo: "🇫🇷",
      colores: ["#2e6fb5", "#0b1a33"],
      duracion: "2 h 50 min",
      ambiente: "Para emocionarse",
    },
    {
      id: "chicago",
      titulo: "Chicago",
      lema: "Todo ese jazz",
      texto: "Cabaret, crímenes y glamour. Coreografías de infarto y un humor muy afilado.",
      glifo: "🎩",
      colores: ["#c9a24b", "#1a1a1a"],
      duracion: "2 h 15 min",
      ambiente: "Elegante y descarado",
    },
    {
      id: "aladdin",
      titulo: "Aladdín",
      lema: "Un mundo ideal",
      texto: "Alfombra voladora, genio y cueva de tesoros: magia para volver a ser niño.",
      glifo: "🧞",
      colores: ["#19b5a5", "#5a1d7a"],
      duracion: "2 h 30 min",
      ambiente: "Magia para todos",
    },
  ],
};
