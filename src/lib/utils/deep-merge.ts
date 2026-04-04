/**
 * UTILITÁRIO DE BLINDAGEM - PILAR 2
 * Mescla objetos profundamente para evitar que atualizações parciais
 * (ex: mudar uma cor) deletem outras propriedades existentes.
 */

export function deepMerge<T>(target: T, source: any): T {
  if (!source) return target;
  if (!target) return source;

  const isObject = (item: any) =>
    item && typeof item === "object" && !Array.isArray(item);

  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  const result: any = { ...target };

  Object.keys(source).forEach((key) => {
    const targetValue = result[key];
    const sourceValue = source[key];

    if (isObject(targetValue) && isObject(sourceValue)) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else {
      result[key] = sourceValue;
    }
  });

  return result;
}
