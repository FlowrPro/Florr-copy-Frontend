// ui.js
export function setupChat(socket) {
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");
  chatInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && chatInput.value.trim() !== "") {
      const text = chatInput.value.trim();
      if (socket) socket.emit("chat_message", { text });
      chatInput.value = "";
    }
  });
  let chatOpen = false;
  document.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!chatOpen) {
        chatInput.classList.remove("hidden");
        chatInput.focus();
        chatOpen = true;
      } else {
        const text = chatInput.value.trim();
        if (text !== "" && socket) {
          socket.emit("chat_message", { text });
          chatInput.value = "";
        }
        chatInput.blur();
        chatInput.classList.add("hidden");
        chatOpen = false;
      }
    }
  });
}
