/**
 * Escapes HTML by converting the input string into a string that is safe for displaying.
 * @param inputString any string to be displayed as text in the user interface
 * @returns a string that is escaped and can safely be displayed as text in the user interface
 */
export default function escapeString(inputString: string): string {
  const dummy = document.createElement("p");
  dummy.innerText = inputString;
  return dummy.innerHTML;
}
