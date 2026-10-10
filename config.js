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

  // Días de margen desde hoy para poder elegir función (tiempo para comprar las entradas)
  antelacionDias: 3,

  // Planes extra para completar la noche (la persona marca los que quiera)
  extras: [
    { id: "cena", emoji: "🍝", titulo: "Cena antes", texto: "Mesa reservada para ir con calma y con hambre." },
    { id: "copa", emoji: "🥂", titulo: "Copa después", texto: "Para comentar la función, entre brindis." },
    { id: "merch", emoji: "🎁", titulo: "Recuerdo", texto: "Te llevas algo del musical como recuerdo." },
  ],
};
