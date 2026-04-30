export const COMUNAS = [
  // Región del Biobío
  "Concepción", "Coronel", "Chiguayante", "Florida", "Hualpén", "Hualqui", "Lota", "Penco", 
  "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Los Ángeles", "Antuco",
  "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo",
  "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío", "Lebu", "Arauco", "Cañete", 
  "Contulmo", "Curanilahue", "Los Álamos", "Tirúa",
  // Región de la Araucanía
  "Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro",
  "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén",
  "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol",
  "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco",
  "Purén", "Renaico", "Traiguén", "Victoria"
].sort();

export const predecirComuna = (direccion: string) => {
  const dirLower = direccion.toLowerCase();
  for (const comuna of COMUNAS) {
    if (dirLower.includes(comuna.toLowerCase())) {
      return comuna;
    }
  }
  return null;
};
