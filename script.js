const formulario = document.getElementById("formulario");
const mensagem = document.getElementById("mensagem");

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    const nome = document.getElementById("nome").value;

    mensagem.textContent = "Formulário enviado com sucesso, " + nome + "!";

    mensagem.style.color = "green";

    formulario.reset();

});
