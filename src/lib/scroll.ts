/**
 * Smoothly scrolls to an element by its ID.
 * @param id The ID of the element to scroll to (with or without #).
 * @param offset Optional offset in pixels (e.g., for fixed headers). Default is 100.
 */
export const scrollToId = (id: string, offset: number = 100) => {
  const cleanId = id.startsWith("#") ? id.slice(1) : id;
  const element = document.getElementById(cleanId);

  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};
