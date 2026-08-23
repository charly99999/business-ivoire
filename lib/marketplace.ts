export function formatFcfa(price: number): string {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(price)} FCFA`;
}
