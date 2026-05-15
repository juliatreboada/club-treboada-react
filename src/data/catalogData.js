// src/data/catalogData.js
const catalogData = [
  {
    id: 1,
    name: "Maillot de entrenamiento",
    price: "28€",
    image: "/images/catalog/maillot-oficial.webp",
    categories: ["maillots", "entrenamiento"],
    description: "Maillot oficial de entrenamiento"
  },
  {
    id: 2,
    name: "Top",
    priceJr: "22€",
    priceSr: "23€",
    price: "Jr 22€ / Sr 23€",
    image: "/images/catalog/top.webp",
    categories: ["partes-superiores", "entrenamiento"]
  },
  {
    id: 3,
    name: "Mini short",
    priceJr: "19€",
    priceSr: "21€",
    price: "Jr 19€ - Sr 21€",
    image: "/images/catalog/short.webp",
    categories: ["partes-inferiores", "entrenamiento"]
  },
  {
    id: 4,
    name: "Zapatillas de Trampolín",
    price: "54€",
    image: "/images/catalog/elite.webp",
    categories: ["calzado", "entrenamiento", "competicion"]
  },
  {
    id: 5,
    name: "Toalla de microfibra",
    price: "19€",
    image: "/images/catalog/toalla.webp",
    categories: ["complementos", "entrenamiento"]
  },
  {
    id: 6,
    name: "Leggins largos",
    price: "Jr 24€ - Sr 27€",
    image: "/images/catalog/leggin.webp",
    categories: ["partes-inferiores", "entrenamiento", "competicion"]
  },
  {
    id: 7,
    name: "Punteras",
    price: "20€",
    image: "/images/catalog/punteras.webp",
    categories: ["calzado", "entrenamiento", "competicion"]
  },
  {
    id: 8,
    name: "Mochila",
    price: "24€",
    image: "/images/catalog/mochila.webp",
    categories: ["complementos", "entrenamiento", "competicion"]
  },
  {
    id: 9,
    name: "Leggin Pirata",
    price: "Jr 23€ - Sr 26€",
    image: "/images/catalog/pirata.webp",
    categories: ["partes-inferiores", "entrenamiento"]
  },
  {
    id: 10,
    name: "Camiseta de asas",
    price: "21€",
    image: "/images/catalog/camiseta-asas.webp",
    categories: ["partes-superiores", "entrenamiento"]
  },
  {
    id: 11,
    name: "Rodilleras",
    price: "16€",
    image: "/images/catalog/rodilleras.webp",
    categories: ["complementos", "entrenamiento"]
  },
  {
    id: 12,
    name: "Camiseta oficial",
    price: "15€",
    image: "/images/catalog/camiseta.webp",
    categories: ["partes-superiores", "competicion"]
  },
  {
    id: 13,
    name: "Maillot básico",
    price: "Jr 14€ - Sr 17€",
    image: "/images/catalog/maillot.webp",
    categories: ["maillots", "entrenamiento"]
  },
  {
    id: 14,
    name: "Zapatillas básicas",
    price: "28€",
    image: "/images/catalog/basicas.webp",
    categories: ["calzado", "entrenamiento", "competicion"]
  },
  {
    id: 15,
    name: "Anorak",
    price: "47€",
    image: "/images/catalog/anorak.webp",
    categories: ["partes-superiores", "entrenamiento", "competicion"]
  },
  {
    id: 16,
    name: "Sudadera",
    price: "40-43€",
    image: "/images/catalog/sudadera.webp",
    categories: ["partes-superiores", "entrenamiento"]
  },
  {
    id: 17,
    name: "Pantalón corto",
    price: "12€",
    image: "/images/catalog/corto.webp",
    categories: ["partes-inferiores", "entrenamiento"]
  },
  {
    id: 18,
    name: "Calentadores",
    price: "11€",
    image: "/images/catalog/calentadores.webp",
    categories: ["complementos", "entrenamiento"]
  },
  {
    id: 19,
    name: "Pantalón de chandal",
    price: "22€",
    image: "/images/catalog/pantalon.webp",
    categories: ["partes-inferiores", "entrenamiento", "competicion"]
  },
  {
    id: 20,
    name: "Chaqueta equipación oficial",
    price: "Jr 45€ - Sr 48€",
    image: "/images/catalog/pantalon.webp", // Note: same image as above, might need separate
    categories: ["partes-superiores", "competicion"]
  }
];

export const categories = [
  { id: "all", label: "Todo", filter: "all" },
  { id: "entrenamiento", label: "Entrenamiento / Calentamientos", filter: "entrenamiento" },
  { id: "competicion", label: "Competición", filter: "competicion" },
  { id: "partes-superiores", label: "Partes de Arriba", filter: "partes-superiores" },
  { id: "partes-inferiores", label: "Partes de Abajo", filter: "partes-inferiores" },
  { id: "maillots", label: "Maillots", filter: "maillots" },
  { id: "calzado", label: "Calzado", filter: "calzado" },
  { id: "complementos", label: "Complementos", filter: "complementos" }
];

export default catalogData;