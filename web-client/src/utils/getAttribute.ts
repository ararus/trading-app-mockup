export function getAttribute(
  element: HTMLElement,
  attributeName: string
): [string, HTMLElement] {
  if (!element) {
    throw new Error(`Attribute "${attributeName}" not found`);
  }
  if (element.hasAttribute(attributeName)) {
    return [element.getAttribute(attributeName) as string, element];
  }
  return getAttribute(element.parentNode as HTMLElement, attributeName);
}
