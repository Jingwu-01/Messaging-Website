export default function escapeString(inputString: string): string {
    const dummy = document.createElement("p");
    dummy.innerText = inputString;
    return dummy.innerHTML;
}